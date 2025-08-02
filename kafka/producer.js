const { producer } = require('./client');

async function produceMessage(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) }
    ]
  });
  await producer.disconnect();
}

module.exports = { produceMessage };
