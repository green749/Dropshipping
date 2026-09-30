import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../types';
import { createSagaAction } from '../sagaUtils';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

// Redux Saga Actions
export const fetchNotifications = createSagaAction<void, Notification[]>('notification/fetchAll');
export const markNotificationRead = createSagaAction<string, Notification>('notification/markRead');

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.is_read).length;
    },
    markNotificationReadSuccess: (state, action: PayloadAction<Notification>) => {
      const idx = state.notifications.findIndex((n) => n.id === action.payload?.id);
      if (idx !== -1) {
        state.notifications[idx].is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    pushNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, is_read: true }));
      state.unreadCount = 0;
    },
  },
});

export const {
  setLoading,
  setNotifications,
  markNotificationReadSuccess,
  pushNotification,
  markAllRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
