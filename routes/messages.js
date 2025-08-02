const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

const { produceMessage } = require('../kafka/producer');

// POST /messages - Create a new message
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const message = new Message({ text });
    await message.save();
    // Produce message to Kafka
    await produceMessage('messages', { id: message._id, text: message.text, createdAt: message.createdAt });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /messages - Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
