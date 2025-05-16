const Notification = require("../model/notificationM");


const notficantionCtrl={
getNTF: async (req, res) => {
  try {
    const userId = req.user._id;

    // Hammasini olish (isRead: true yoki false)
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'username');

    // O'qilmaganlar sonini aniqlash
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({message:"Notifications",notifications,unreadCount});
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: error.message });
  }
},
  checkNTF: async (req, res) => {
    try {
       const userId = req.user._id;
       const { id } = req.params;


    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId, isRead: false },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found or already read." });
    }

    // Yangilangan holatni qaytaramiz
    res.status(200).json({ message: "Notification marked as read.", notification: updated });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  },
deleteOneNTF: async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // notificationId

    const notification = await Notification.findById(id)
      .populate('sender', 'username')

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Faqat egasi yoki admin o‘chira oladi
    if (notification.recipient.toString() !== userId.toString() ) {
      return res.status(403).json({ message: "You don't have permission to delete this notification" });
    }

    await notification.deleteOne();

    res.status(200).json({
      message: "Notification deleted successfully.",
      deletedNotification: notification
    });

  } catch (error) {
    console.log(error);
    res.status(503).json({ message: error.message });
  }
},

deleteAllNTF: async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationsToDelete = await Notification.find({ recipient: userId })
      .populate('sender', 'username ')
      .sort({ createdAt: -1 });

   
    await Notification.deleteMany({ recipient: userId });

    res.status(200).json({
      message: "All your notifications deleted successfully.",
      deletedNotifications: notificationsToDelete
    });
  } catch (error) {
    console.log(error);
    res.status(503).json({ message: error.message });
  }
}



  


}
module.exports=notficantionCtrl