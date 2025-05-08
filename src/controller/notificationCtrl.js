const notificationM = require("../model/notificationM");


const notficantionCtrl={
  getNTF: async(req,res)=>{
try {
    const userId = req.user._id;

    const notifications = await notificationM.find({ recipient: userId, isRead: false  })
      .sort({ createdAt: -1 }) 
      .populate('sender', 'username profileImage') // sender haqida qo‘shimcha info (agar kerak bo‘lsa)

    res.status(200).json({ notifications });
} catch (error) {
    console.log(error);
   res.status(503).json({ message: error.message });
}
  },
  checkNTF: async (req, res) => {
    try {
      const userId = req.user._id;
  
      await notificationM.updateMany(
        { recipient: userId, isRead: false }, // Faqat o‘qilmaganlar
        { $set: { isRead: true } }            // Endi o‘qilgan deb belgilaymiz
      );
      const notifications = await notificationM.find({ recipient: userId })
      .sort({ createdAt: -1 })
      
      res.status(200).json({ message: "All notifications marked as read." ,notifications });
    } catch (error) {
      console.log(error);
      res.status(503).json({ message: error.message });
    }
  }
  


}
module.exports=notficantionCtrl