const { consumer } = require('./client');
const Message = require('../models/Message');

// Start Kafka consumer to save messages to MongoDB
(async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'messages', fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                // Avoid duplicate insert if already in DB
                const exists = await Message.findById(data.id);
                if (!exists) {
                    await Message.create({ _id: data.id, text: data.text, createdAt: data.createdAt });
                    console.log('Consumed and saved message:', data);
                }
            } catch (err) {
                console.error('Error consuming message:', err);
            }
        }
    });
})();