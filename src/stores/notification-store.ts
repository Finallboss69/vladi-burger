import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = crypto.randomUUID();
        set(
          (state) => ({
            notifications: [...state.notifications, { ...notification, id }],
          }),
          false,
          'addNotification',
        );
      },

      removeNotification: (id: string) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'removeNotification',
        ),
    }),
    { name: 'NotificationStore' },
  ),
);
