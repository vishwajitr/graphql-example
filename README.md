Graphql exmaple to show stocks data and can add new stock entry

To get all stocks
query {
  stocks {
    symbol
    name
    price
    change
    volume
  }
}

To add TSLA stock data
mutation {
  addStock(symbol: "TSLA", name: "Tesla, Inc.") {
    symbol
    name
  }
}


To get AAPL stock data
query {
  stock(symbol: "AAPL") {
    symbol
    name
    price
    change
    volume
  }
}
