const elasticsearch = require("elasticsearch");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const client = new elasticsearch.Client({
  hosts: ["http://192.168.33.10:9200"],
});

const app = express();

client
  .ping({
    requestTimeout: 30000,
  })
  .then(() => {
    console.info("Elasticsearch connection successful");
  })
  .catch((err) => {
    console.error("Elasticsearch connection failed");
  });

app.use(bodyParser.json());
app.set("host", "192.168.33.10");
app.set("port", process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.sendFile("template.html", {
    root: path.join(__dirname, "views"),
  });
});

// This template queries elasticsearch directly rather than making a request to the server
app.get("/v2", (req, res) => {
  res.sendFile("template2.html", {
    root: path.join(__dirname, "views"),
  });
});

app.get("/elasticsearch.min.js", (req, res) => {
  res.sendFile("elasticsearch.min.js", {
    root: path.join(__dirname, "public"),
  });
});

app.get("/search", (req, res) => {
  // Declare the query object to search elastic search and return only 200 results from the first result found.
  // Also match any data where the name is like the query string sent in
  let body = {
    size: 200, // Return only 200 results
    from: 0, // Return resultings starting from index 0
    // Elasticsearch query
    query: {
      match: {
        name: req.query["q"], // q is the search query
      },
    },
  };

  // Make search query to elasticsearch
  client
    .search({
      index: "elasticsearch_search_engine",
      body: body, // The query body
      type: "cities_list",
    })
    .then((response) => {
      // Sample response
      // {
      //   took: 88, // milliseconds
      //   timed_out: false,
      //   _shards: { total: 5, successful: 5, failed: 0 },
      //   hits:
      //   {
      //     total: 59, // total matched results
      //     max_score: 5.9437823, // maximum score
      //     hits:
      //     [
      //       {
      //         "_index":"scotch.io-tutorial",
      //         "_type":"cities_list",
      //         "_id":"AV-xjywQx9urn0C4pSPv",
      //         "_score":5.9437823,
      //         "_source":
      //           {
      //             "country":"ES",
      //             "name":"A Coruña",
      //             "lat":"43.37135",
      //             "lng":"-8.396"
      //           }
      //         },
      //     ...
      res.send(response.hits.hits);
    })
    .catch((err) => {
      console.log(err);
      res.send([]);
    });
});

app.listen(app.get("port"), function () {
  console.log("Server listening on port " + app.get("port"));
});
