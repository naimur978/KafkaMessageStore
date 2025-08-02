



## What is this project?

I started this project because I wanted to put into practice what I learned about Kafka. After reading and watching tutorials about how Kafka can help build scalable, event-driven systems, I thought: why not try it out with a simple message storing app? The idea came to me when I realized that most apps just save data directly to a database, but with Kafka, you can make things more flexible and powerful by letting different parts of your system react to new messages in real time or in the background.

So, this project is my way of experimenting with Kafka. It saves messages to MongoDB right away, but also sends them to Kafka so I (or any other service) can do more things with those messages later—like analytics, notifications, or anything else. It's a hands-on implementation of the concepts I learned about Kafka and event-driven architecture.

# Folder Architecture

```
KafkaMessageStore/
├── app.js
├── kafka/
│   ├── client.js
│   ├── consumer.js
│   └── producer.js
├── models/
│   └── Message.js
├── routes/
│   └── messages.js
├── package.json
├── package-lock.json
└── README.md
```

---


# How to Run This Project

## Prerequisites

* Node.js (v14 or newer recommended)
* MongoDB (running locally or accessible remotely)
* Kafka (running locally or accessible remotely, default broker: localhost:9092)

## Step-by-Step Installation and Running

### 1. Clone the repository
```sh
git clone https://github.com/naimur978/KafkaMessageStore.git
cd KafkaMessageStore
```

### 2. Install dependencies
```sh
npm install
```

### 3. Install and start MongoDB
If you do not have MongoDB, download and install it from https://www.mongodb.com/try/download/community
Start MongoDB in a new terminal:
```sh
mongod
```

### 4. Install and start Kafka
Download Kafka (Scala 2.13) from https://kafka.apache.org/downloads and extract it.

Open two terminals in your Kafka folder:

**Terminal 1: Start Zookeeper**
```sh
bin/zookeeper-server-start.sh config/zookeeper.properties
```

**Terminal 2: Start Kafka Broker**
```sh
bin/kafka-server-start.sh config/server.properties
```

Keep both Zookeeper and Kafka running in their own terminals.

### 5. Run the project
Open a new terminal in your project directory and run:
```sh
node app.js
```
In another terminal, run:
```sh
node kafka/consumer.js
```

### 6. Test the API
Use Postman or curl to POST to http://localhost:3000/messages with JSON like:
```json
{
   "text": "your message"
}
```




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

4. **Kafka Consumer (`kafka/consumer.js`)** (run as a separate process) listens to the `messages` topic.

5. **On receiving a Kafka message**, the consumer parses the message and saves it to MongoDB (if not already present).

---

### Sequence Diagram


```
Client
   |
   v
Express API (app.js)
   |\
   | \__> MongoDB (immediate write)
   |
   v
Kafka Producer (routes/messages.js)
   |
   v
Kafka Broker (topic: messages)
   |
   v
Kafka Consumer (kafka/consumer.js)
   |
   v
MongoDB (idempotent write)
```

- The POST request both saves to MongoDB and sends to Kafka.
- The consumer ensures all Kafka messages are also stored in MongoDB (idempotent).




## Files
- `models/Message.js`: Mongoose schema for messages
- `routes/messages.js`: Express routes for POST/GET
- `kafka/producer.js`: Kafka producer logic
- `kafka/consumer.js`: Kafka consumer logic and saves messages to MongoDB


## How Kafka Handles Data Retention

Kafka does not save data for unlimited time. Its main purpose is to act as a buffer and event manager, letting you process messages asynchronously and decouple different parts of your system. By default, Kafka keeps messages for a certain period or until a topic reaches a certain size, and then deletes them. If you want to control how long messages are kept, you can set a retention time for each topic. For example, to keep messages for 24 hours, you can run:

```sh
kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name messages --alter --add-config retention.ms=86400000
```

This will keep messages in the 'messages' topic for 24 hours (in milliseconds). Adjust the value as needed for your use case.

## API Documentation (Postman)

### POST /messages

Create a new message.

**How to use in Postman:**
1. Set the request type to `POST`.
2. Enter the URL: `http://localhost:3000/messages`
3. Go to the "Body" tab, select "raw", and choose "JSON" from the dropdown.
4. Enter this JSON:
    ```json
    {
       "text": "your message"
    }
    ```
5. Click "Send".

**Response:**
Returns the created message object with its id and timestamp.

---

### GET /messages

Get all messages (sorted by most recent first).

**How to use in Postman:**
1. Set the request type to `GET`.
2. Enter the URL: `http://localhost:3000/messages`
3. Click "Send".

**Response:**
Returns an array of message objects.

---
