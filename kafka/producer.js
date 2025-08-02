const { producer } = require('./client');

async function produceMessage(topic, message) {
  await producer.connect();
  console.log(`[PRODUCER] Connected to broker(s)`);
  console.log(`[PRODUCER] Producing to topic: ${topic}`);
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) }
    ]
  });
  console.log(`[PRODUCER] Produced message:`, message);
  await producer.disconnect();
}

module.exports = { produceMessage };
