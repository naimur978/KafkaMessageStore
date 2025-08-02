const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kafka-message-store',
  brokers: ['localhost:9092'] // Update if your broker is elsewhere
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'message-group' });

module.exports = { kafka, producer, consumer };
