const { consumeMessages } = require('./consumer');
const Message = require('../models/Message');

// Start Kafka consumer to save messages to MongoDB
consumeMessages('messages', async(msg) => {
    try {
        const data = JSON.parse(msg);
        // Avoid duplicate insert if already in DB
        const exists = await Message.findById(data.id);
        if (!exists) {
            await Message.create({ _id: data.id, text: data.text, createdAt: data.createdAt });
            console.log('Consumed and saved message:', data);
        }
    } catch (err) {
        console.error('Error consuming message:', err);
    }
});