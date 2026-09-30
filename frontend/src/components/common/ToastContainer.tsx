import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeToast } from '../../store/slices/uiSlice';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastItem: React.FC<{ toast: any; dispatch: any }> = ({ toast, dispatch }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl shadow-lg transition-all duration-300 animate-slide-in border ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : isError
          ? 'border-rose-200 bg-rose-50 text-rose-800'
          : isWarning
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-indigo-200 bg-indigo-50 text-indigo-800'
      }`}
    >
      <div className="flex items-center space-x-3">
        {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-500 shrink-0" />}
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors text-slate-500 hover:text-slate-800 ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dispatch={dispatch} />
      ))}
    </div>
  );
};
