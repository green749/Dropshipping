import type { Middleware, UnknownAction } from '@reduxjs/toolkit';

export interface SagaPromiseResult<T = any> {
  payload: T;
  success?: boolean;
  error?: boolean;
}

export interface SagaActionMeta<T = any> {
  sagaPromise?: boolean;
  resolve?: (value: T) => void;
  reject?: (reason: any) => void;
  [key: string]: any;
}

export interface SagaAction<P = any, R = any> extends UnknownAction {
  type: string;
  payload: P;
  meta?: SagaActionMeta<R>;
  [key: string]: any;
}

export interface SagaActionCreator<P = void, R = any> {
  (payload?: P): SagaAction<P, R>;
  type: string;
  fulfilled: {
    match: (res: any) => res is { payload: R; success: true };
  };
  rejected: {
    match: (res: any) => res is { payload: any; error: true };
  };
}

export function createSagaAction<P = void, R = any>(type: string): SagaActionCreator<P, R> {
  const creator = ((payload?: P) => ({
    type,
    payload,
    meta: {
      sagaPromise: true,
    },
  })) as unknown as SagaActionCreator<P, R>;

  creator.type = type;

  creator.fulfilled = {
    match: (res: any): res is { payload: R; success: true } => {
      return Boolean(res && res.success === true && !res.error);
    },
  };

  creator.rejected = {
    match: (res: any): res is { payload: any; error: true } => {
      return Boolean(res && res.error === true);
    },
  };

  return creator;
}

export const sagaPromiseMiddleware: Middleware = () => (next) => (action: any) => {
  if (action && typeof action === 'object' && action.meta?.sagaPromise) {
    return new Promise<SagaPromiseResult>((resolve) => {
      action.meta = {
        ...action.meta,
        resolve: (val: any) => resolve({ payload: val, success: true }),
        reject: (err: any) => resolve({ payload: err, error: true }),
      };
      next(action);
    });
  }
  return next(action);
};
