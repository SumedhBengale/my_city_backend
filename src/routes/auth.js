const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { requireAuth, verifyEmailMSG91 } = require('../middlewares/authMiddleware');


const router = express.Router();

// Validation schema using Joi
const signupSchema = Joi.object({
    userName: Joi.string().required().min(3).max(20),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
  });

  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
  });

// POST /api/signup
router.post('/signup', async (req, res) => {
    try {
      // Validate the request body
      const { error } = signupSchema.validate(req.body);
      if (error) {
        console.log(error)
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const { userName, email, password } = req.body;
  
      // Check if the user already exists
      const existingUser = await User.findOne({ 
        //check if email or username already exists
        $or: [
          { email: email },
          { userName: userName}
        ]
       });
      if (existingUser) {
        return res.status(409).json({ message: 'Email or Username already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      //Generate an verification token, this will be sent to the user's email validity 24 hours
      const verificationToken = jwt.sign({userName: userName, email: email}, process.env.JWT_SECRET, { expiresIn: '24h' });
      //hash the verification token and store it in the database
      const hashedVerificationToken = await bcrypt.hash(verificationToken, 10);

      // Create a new user with hashed password
      const newUser = new User({
        userName,
        email,
        password: hashedPassword,
        verificationToken: hashedVerificationToken,
        isVerified: false,
      });
  
      verifyEmailMSG91(userName, email, verificationToken);
      // Save the user to the database
      await newUser.save();
  
      // Return a success message
      console.log("User created successfully")

      const payload = { sub: newUser._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });

      return res.status(200).json({ message: 'User created successfully', status: 200, token: token, userId : newUser._id, userType: newUser.type });
    } catch (error) {
      console.error('Error in signup:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      // Validate the request body
      const { error } = loginSchema.validate(req.body);
      if (error) {
        console.log(error)
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT
      const payload = { sub: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });
      
      //check if user is verified
      if(!user.isVerified){
        return res.status(403).json({ message: 'User not verified' });
      }

      // Create the string of userId and token
      console.log("ID: ", user._id, "Token: ", token, "User Type: ", user.type)
      res.status(200).json({ token: token, userId : user._id, userType: user.type });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // POST /api/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { verificationToken } = req.body;
    console.log(verificationToken)
    //get the email from the verification token
    const decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);
    const email = decodedToken.email;
    console.log(email)
    // Find the user with the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //check if the user is already verified
    if(user.isVerified){
      return res.status(409).json({ message: 'User already verified' });
    }
    //check if the verification token is valid
    console.log(verificationToken, user.verificationToken)
    const isTokenValid = await bcrypt.compare(verificationToken, user.verificationToken);
    if (!isTokenValid) {
      return res.status(401).json({ message: 'Invalid verification token' });
    }
    // update the user to verified
    user.isVerified = true;
    await user.save();
    // Return a success message
    return res.status(200).json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('Error in verifying email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



  router.get('/account', requireAuth, (req, res) => {
    const { userName, email } = req.user; // Access the user object from req.user
  
    res.status(200).json({ userName, email });
  });

module.exports = router;
