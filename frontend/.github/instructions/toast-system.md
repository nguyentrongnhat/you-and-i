# Notification System Rules

- ToastService is the only allowed API for notifications
- MessageService must not be used directly
- All notifications use MESSAGE_TYPE enum
- Global <p-toast /> handles rendering