const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authCtrl = {
  signup: async (req, res) => {
    try {
      const { username, surname, email, password, dateBirth,role } = req.body;
      
      if (!username || !surname || !email || !password || !dateBirth) {
        return res.status(403).json({ message: "Please fill all fields" });
      }
      
      const birthDate = new Date(dateBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return res.status(403).json({ message: "You must be at least 18 years old to sign up." });
      }
      
      const oldUser = await User.findOne({ email });
      if (oldUser) {
        return res.status(400).json({ message: "This email already exists!" });
      }
      
      const hashPassword = await bcrypt.hash(password, 10);
      
      const newUser = new User({
        username,
        surname,
        email,
        password: hashPassword,
        dateBirth,
        role
      });
      
      await newUser.save();
      
      const { password:pw, ...other } = newUser._doc;
      
      
      const token = JWT.sign(other, JWT_SECRET_KEY, { expiresIn: "48h" });
      
      res.status(201).json({
        message: "Signup successful",
        user: other,
        token
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  } ,
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(403).send({ message: "Please fill all fields" });
      }
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send({ message: "Invalid email" });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({ message: "Invalid password" });
      }
      
      const { password: pw, ...userData } = user._doc;
      
      const token = JWT.sign(userData, JWT_SECRET_KEY, { expiresIn: "48h" });
      
      res.status(200).send({
        message: "Login successful",
        user: userData,
        token
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
};

module.exports = authCtrl;
