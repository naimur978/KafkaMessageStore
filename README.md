### How to Set Kafka Retention Policy

You can set the retention policy for your Kafka topic (e.g., `messages`) using the following command:

```sh
kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name messages --alter --add-config retention.ms=86400000
```

This example sets the retention to 24 hours (in milliseconds). Adjust the value as needed for your use case.

## Kafka Retention Policy

Kafka has its own retention policy that determines how long messages stay in a Kafka topic. Kafka does not delete messages immediately once they're consumed.

- Kafka stores messages in topics for a set period (or until the topic reaches a certain size), which is controlled by retention policies.
- This allows consumers to re-read or replay messages as needed, and provides durability even if a consumer is temporarily offline.


# KafkaMessageStore
## Why Use Both MongoDB and Kafka?

Kafka is a messaging system designed to handle large streams of data in a distributed, fault-tolerant, and scalable way. It's not necessarily meant to be the final storage system for your data.

**Purpose of this architecture:**

- **Kafka** acts as a buffer and message broker, enabling asynchronous, decoupled, and reliable data flow between services. It ensures that messages are not lost even if the database or consumer is temporarily unavailable.
- **MongoDB** is used as the final persistent storage for your data.

**Why save to both?**
- Saving to MongoDB immediately (in the API) gives instant feedback to the client and ensures data is available for reads.
- Sending to Kafka allows other services (analytics, notifications, backups, etc.) to consume the same data stream independently and reliably, even if MongoDB is slow or temporarily down.
- Kafka provides durability, replay, and scalability for distributed systems.

This pattern is common in event-driven architectures and microservices, where Kafka acts as the backbone for data movement and MongoDB (or another database) is the system of record.



## Project Flow: POST Request to MongoDB via Kafka

1. **Client sends a POST request** to `/messages` with JSON `{ "text": "your message" }`.

2. **Express route (`routes/messages.js`)** receives the request, saves the message to MongoDB, and then produces a Kafka message to the `messages` topic with the message data.

3. **Kafka Producer (`kafka/producer.js`)** sends the message to the Kafka broker.

4. **Kafka Consumer App (`kafka/consumerApp.js`)** (run as a separate process) listens to the `messages` topic.

5. **On receiving a Kafka message**, the consumer parses the message and saves it to MongoDB (if not already present).

---

### Sequence Diagram

```
Client --> Express API --> MongoDB
           |                ^
           v                |
        Kafka Producer --> Kafka Broker --> Kafka Consumer --> MongoDB
```

- The POST request both saves to MongoDB and sends to Kafka.
- The consumer ensures all Kafka messages are also stored in MongoDB (idempotent).

---

## How to Run

1. Start MongoDB and Kafka broker (default: `localhost:27017` and `localhost:9092`).
2. Start the API server:
   ```sh
   node app.js
   ```
3. In another terminal, start the Kafka consumer app:
   ```sh
   node kafka/consumerApp.js
   ```
4. Use Postman or `curl` to POST messages to `http://localhost:3000/messages`.

---

## Files
- `models/Message.js`: Mongoose schema for messages
- `routes/messages.js`: Express routes for POST/GET
- `kafka/producer.js`: Kafka producer logic
- `kafka/consumer.js`: Kafka consumer logic (reusable)
- `kafka/consumerApp.js`: Runs the consumer and saves messages to MongoDB
