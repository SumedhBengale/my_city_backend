const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Residence = require('../models/Residence');
const { requireAuth } = require('../middlewares/authMiddleware');

// GET /api/wishlist/get
router.post('/getWishlist', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the wishlist for the user
    const wishlist = await Wishlist.findOne({ userId }).populate('wishlistItems.residenceId');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Extract wishlist items
    const wishlistItems = wishlist.wishlistItems;

    // Return the wishlist items to the frontend
    res.status(200).json({ wishlistItems });
  } catch (error) {
    console.error('Error in retrieving wishlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/wishlist/add
router.post('/add', requireAuth, async (req, res) => {
    try {
      const { residenceId, userId } = req.body;
  
      // Check if the wishlist item already exists for the user
      const wishlist = await Wishlist.findOne({ userId });
  
      if (wishlist) {
        // Check if the residenceId already exists in the wishlistItems array
        const isItemExists = wishlist.wishlistItems.some(
          (item) => item.residenceId.toString() === residenceId
        );
  
        if (isItemExists) {
          return res.status(400).json({ message: 'Listing already exists in the wishlist' });
        }
  
        // If the item doesn't exist, add it to the wishlistItems array
        wishlist.wishlistItems.push({ residenceId });
        await wishlist.save();
      } else {
        // If the wishlist doesn't exist, create a new wishlist with the item
        const newWishlist = new Wishlist({
          userId,
          wishlistItems: [{ residenceId }],
        });
        await newWishlist.save();
      }
  
      // Return a success message
      res.status(201).json({ message: 'Listing added to wishlist', status: 201 });
    } catch (error) {
      console.error('Error in adding listing to wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // DELETE /api/wishlist/delete
router.post('/delete', requireAuth, async (req, res) => {
    try {
      const { id, userId } = req.body;
      console.log(id, userId);
      // Find the user's wishlist
      const wishlist = await Wishlist.findOne({ userId });
      console.log(wishlist)
  
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }
  
      // Remove the item with the id
      wishlist.wishlistItems = wishlist.wishlistItems.filter(
        (item) => item._id.toString() !== id
      );
      console.log(wishlist.wishlistItems)

      // Save the wishlist
      await wishlist.save();

  
      // Return a success message
      res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Error in deleting item from wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  
  module.exports = router;