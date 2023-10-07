
const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();
const jwt_decode = require("jwt-decode");


// Route to get user from token in request body

router.post('/account', requireAuth, async (req, res) => {
    const { token } = req.body;
    //decode sub from token
    const decoded = jwt_decode(token);
    const id = decoded.sub;
    console.log("ID", id);
    try {

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//delete account
router.post('/deleteAccount', requireAuth, async (req, res) => {
    const { token } = req.body;
    //decode sub from token
    const decoded = jwt_decode(token);
    const id = decoded.sub;
    console.log("ID", id);
    try {

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


module.exports = router;