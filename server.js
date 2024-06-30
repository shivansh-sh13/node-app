const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Set up MongoDB connection
mongoose.connect('mongodb+srv://sahushivansh447:iY22qWWuWgSRbMFZ@hodlinfo.cvzufk5.mongodb.net/?retryWrites=true&w=majority&appName=Hodlinfo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Ticker = mongoose.model('Ticker', tickerSchema);


const fetchAndStoreData = async () => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickers = Object.values(response.data).slice(0, 10);

    // Clear existing data
    await Ticker.deleteMany({});

    // Store new data
    await Ticker.insertMany(tickers.map(ticker => ({
      name: ticker.name,
      last: ticker.last,
      buy: ticker.buy,
      sell: ticker.sell,
      volume: ticker.volume,
      base_unit: ticker.base_unit,
    })));

    console.log('Data fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
};


setInterval(fetchAndStoreData, 3600000);
fetchAndStoreData();


app.get('/api/tickers', async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    res.json(tickers);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

