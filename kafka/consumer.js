const { consumer } = require('./client');

async function consumeMessages(topic, onMessage) {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
        eachMessage: async({ message }) => {
            onMessage(message.value.toString());
        }
    });
}

module.exports = { consumeMessages };