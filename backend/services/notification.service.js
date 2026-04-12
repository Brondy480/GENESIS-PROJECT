;import Notification from "../models/Notifications.model.js";
export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  data = {},
  session = null,
}) => {
  const options = session ? { session } : {};

  await Notification.create(
    [    
      {
        recipient,
        type,
        title,
        message,
        data,
      },
    ],
    options
  );
};