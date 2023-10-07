const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { requireAuth, verifyEmail, resetPassword } = require('../middlewares/authMiddleware');
const passport = require('passport');
const axios = require('axios');


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

router.get('/client-id', (req, res) => {
  res.status(200).json({ googleClientId: process.env.GOOGLE_CLIENT_ID, facebookAppId: process.env.FACEBOOK_APP_ID });
});

router.post('/facebook', async (req, res) => {
  try {
    const { data } = req.body; //data contains access_token and user_id, which we will use to fetch user information from facebook

    const accessToken = data.authResponse.accessToken;
    const userId = data.authResponse.userID;
    console.log(data)

    // Use the access token to fetch user information from Facebook
    const { data: userData } = await axios.get(`https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${accessToken}`);

    // Check if the user already exists in your database based on the Facebook ID
    const existingUser = await User.findOne({ facebookId: userData.id });

    if (existingUser) {
      const payload = { sub: existingUser._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });
      // User already exists, return a JWT token
      res.status(200).json({ message: 'User found', token: token, userId: existingUser._id, userType: existingUser.type, user: existingUser });
    }
    else {
      // User doesn't exist, you can create a new user and return a JWT token or any other response

      //If the email already exists, return an error
      if (userData.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          return res.status(409).json({ message: 'Email already exists' });
        }
      }

      const newUser = new User({
        authType: 'facebook',
        facebookId: userData.id,
        email: userData.email ? userData.email : '',
        userName: userData.name,
        isVerified: true,
        type: 'user',
        // Add other user properties as needed
      });

      //generate jwt token
      const payload = { sub: newUser._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });

      await newUser.save();
      res.status(200).json({ message: 'User created', token: token, userId: newUser._id, userType: newUser.type, user: newUser });
    }
  }
  catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({ message: 'Facebook login error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { code } = req.body;
    console.log(code)

    const accessToken = code.access_token;

    // Use the access token to fetch user information from Google
    const { data: userData } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(userData)
    // Check if the user already exists in your database based on the Google ID
    const existingUser = await User.findOne({ googleId: userData.sub });

    if (existingUser) {
      const payload = { sub: existingUser._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });
      // User already exists, return a JWT token
      res.status(200).json({ message: 'User found', token: token, userId: existingUser._id, userType: existingUser.type, user: existingUser });
    } else {

      //If the email already exists, return an error
      if (userData.email) {
        const existingEmail = await User.findOne({ email: userData.email });
        if (existingEmail) {
          return res.status(409).json({ message: 'Email already exists' });
        }
      }

      // User doesn't exist, you can create a new user and return a JWT token or any other response
      const newUser = new User({
        authType: 'google',
        googleId: userData.sub,
        email: userData.email,
        userName: userData.name,
        isVerified: true,
        type: 'user',
        // Add other user properties as needed
      });

      //generate jwt token
      const payload = { sub: newUser._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });

      await newUser.save();
      res.status(200).json({ message: 'User created', token: token, userId: newUser._id, userType: newUser.type, user: newUser });
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login error' });
  }
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
        { userName: userName }
      ]
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email or Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Generate an verification token, this will be sent to the user's email validity 24 hours
    const verificationToken = jwt.sign({ userName: userName, email: email }, process.env.JWT_SECRET, { expiresIn: '24h' });
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

    verifyEmail(userName, email, verificationToken);
    // Save the user to the database
    await newUser.save();

    // Return a success message
    console.log("User created successfully")

    const payload = { sub: newUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1y' });

    return res.status(200).json({ message: 'User created successfully', status: 200, token: token, userId: newUser._id, userType: newUser.type });
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

    //If authType is not local, return an error
    if (user.authType !== 'local') {
      return res.status(404).json({ message: 'Invalid credentials' });
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
    if (!user.isVerified) {
      return res.status(403).json({ message: 'User not verified' });
    }

    // Create the string of userId and token
    console.log("ID: ", user._id, "Token: ", token, "User Type: ", user.type)
    res.status(200).json({ token: token, userId: user._id, userType: user.type });
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
    if (user.isVerified) {
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


//forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT
    const payload = { sub: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    //hash the verification token and store it in the database
    const hashedPasswordToken = await bcrypt.hash(token, 10);
    //save the hashed password token to the database
    user.passwordResetToken = hashedPasswordToken;
    await user.save();

    //send the reset password link to the user's email
    resetPassword(email, token);

    // Create the string of userId and token
    console.log("ID: ", user._id, "Token: ", token, "User Type: ", user.type)

    return res.status(200).json({ message: 'Reset password link sent to your email', status: 200, token: token, userId: user._id, userType: user.type });
  }
  catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

});

//Verify password reset token route
router.post('/verify-password-token', async (req, res) => {

  const { passwordToken } = req.body;

  try {
    //get the email from the verification token
    const decodedToken = jwt.verify(passwordToken, process.env.JWT_SECRET);
    const id = decodedToken.sub;

    // Find the user with the email
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //compare the password token with the one in the database
    const isTokenValid = await bcrypt.compare(passwordToken, user.passwordResetToken);
    if (!isTokenValid) {
      return res.status(401).json({ message: 'Invalid password reset token' });
    }
    // Return a success message
    return res.status(200).json({ message: 'Password reset token verified successfully' });
  } catch (error) {
    console.error('Error in verifying password reset token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//Reset password route
router.post('/reset-password', async (req, res) => {
  try {

    const { passwordToken, password } = req.body;

    //get the email from the verification token
    const decodedToken = jwt.verify(passwordToken, process.env.JWT_SECRET);
    const id = decodedToken.sub;

    // Find the user with the email
    const user = await User.findById(id);

    //compare the password token with the one in the database
    const isTokenValid = await bcrypt.compare(passwordToken, user.passwordResetToken);
    if (!isTokenValid) {
      return res.status(401).json({ message: 'Invalid password reset token' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update the user's password
    user.password = hashedPassword;
    await user.save();


    //Remove the password reset token from the database
    user.passwordResetToken = undefined;
    await user.save();

    // Return a success message
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetting password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

});


router.get('/account', requireAuth, (req, res) => {
  const { userName, email } = req.user; // Access the user object from req.user

  res.status(200).json({ userName, email });
});

module.exports = router;
