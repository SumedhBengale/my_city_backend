const express = require('express');
const Chat = require('../models/Chat');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/getChat', requireAuth, async (req, res) => {
    try {
        const { userId } = req.body;

        //Check if the chat already with the user exists, if it does, return the chat, else create a new chat and return it

        // Check if the chat already exists

        Chat.findOne({ userId: userId }).then(async (chat) => {
            if (chat) {
                // Return the chat id
                console.log(chat)
                res.status(200).json({ chat:chat, status:200 });
            } else {
                // Create a new chat
                const chat = new Chat({ userId });
    
            // Save the chat to the database
            await chat.save();
            
            // Return the saved chat
            res.status(201).json({ chat:chat, status:201 });
            }
        });

    } catch (error) {
        console.error('Error in adding chat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a message to a chat
router.post('/addMessage', async (req, res) => {
    try {
      const { chatId, message } = req.body;

      // Check if a chat already exists for the given userId
      const chat = await Chat.findById(chatId);

      chat.messages.push({
        message: message,
        typeoFMessage: 'text',
        date: new Date(),
        sender: 'user',
      });

      // Save the chat in the database
      await chat.save();

      res.status(200).json({ chat: chat, status: 200 });
    } catch (error) {
        console.error('Error in adding message:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  //route for admin to add a message to a chat
  router.post('/adminAddMessage', async (req, res) => {
    try {
      const { chatId, message } = req.body;

      // Check if a chat already exists for the given userId
      const chat = await Chat.findById(chatId);

      chat.messages.push({
        message: message,
        typeoFMessage: 'text',
        date: new Date(),
        sender: 'admin',
      });

      // Save the chat in the database
      await chat.save();

      res.status(200).json({ chat: chat, status: 200 });
    } catch (error) {
        console.error('Error in adding message:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });



// Create or retrieve a chat
router.post('/initiateChat', async (req, res) => {
    try {
      const { userId, residenceId, chatId, message } = req.body;
  
      // Check if a chat already exists for the given userId
      let chat = await Chat.findById(chatId);

        chat.messages.push({
          message: message,
          typeoFMessage: 'text',
          date: new Date(),
          sender: 'user',
        });
  
      if (residenceId) {
        // If residenceId is provided, add it to the new message
        chat.messages.push({
          message: `Property of interest: ${residenceId}`,
          typeoFMessage: 'property',
          date: new Date(),
          sender: 'user',
        });
      }
  
      // Save the chat in the database
      await chat.save();
  
      res.status(200).json({ chat: chat, status: 200 });
    } catch (error) {
        console.error('Error in adding message:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

module.exports = router;