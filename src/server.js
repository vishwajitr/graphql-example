require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios');

// Sample stock data (you can replace with real API calls)
const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' }
];

// GraphQL Schema
const schema = buildSchema(`
  type Stock {
    symbol: String!
    name: String!
    price: Float
    change: Float
    volume: Int
  }

  type StockPrice {
    symbol: String!
    price: Float!
    timestamp: String!
  }

  type Query {
    stocks: [Stock]
    stock(symbol: String!): Stock
    stockPrice(symbol: String!): StockPrice
  }

  type Mutation {
    addStock(symbol: String!, name: String!): Stock
  }
`);

// Resolvers
const root = {
  stocks: () => stocks,
  
  stock: async ({ symbol }) => {
    const stock = stocks.find(s => s.symbol === symbol.toUpperCase());
    if (!stock) return null;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`
      );
      
      const quote = response.data['Global Quote'];
      return {
        ...stock,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        volume: parseInt(quote['06. volume'])
      };
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return stock;
    }
  },

  stockPrice: async ({ symbol }) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`
      );
      
      const quote = response.data['Global Quote'];
      return {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching stock price:', error);
      throw new Error('Unable to fetch stock price');
    }
  },

  addStock: ({ symbol, name }) => {
    const newStock = { symbol: symbol.toUpperCase(), name };
    stocks.push(newStock);
    return newStock;
  }
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Stock Market GraphQL API running at http://localhost:${PORT}/graphql`);
});
