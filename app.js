const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const messagesRouter = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/kafkamessagestore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/messages', messagesRouter);

app.get('/', (req, res) => {
  res.send('Kafka Message Store API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
