const { consumer } = require('./client');
const Message = require('../models/Message');

(async () => {
        await consumer.connect();
        console.log(`[CONSUMER] Connected to broker(s)`);
        const topic = 'messages';
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log(`[CONSUMER] Subscribed to topic: ${topic}`);
    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                // Avoid duplicate insert if already in DB
                const exists = await Message.findById(data.id);
                if (!exists) {
                    await Message.create({ _id: data.id, text: data.text, createdAt: data.createdAt });
                    console.log('[CONSUME] Consumed and saved message:', data);
                } else {
                    console.log('[CONSUME] Duplicate message ignored:', data);
                }
            } catch (err) {
                console.error('[CONSUME] Error consuming message:', err);
            }
        }
    });
})();