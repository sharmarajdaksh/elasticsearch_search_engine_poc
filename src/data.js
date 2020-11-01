const elasticsearch = require("elasticsearch");

const client = new elasticsearch.Client({
  hosts: ["http://192.168.33.10:9200"],
});

const cities = require("./cities.json");

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

// Unlike normal databases, an Elasticsearch index is a place to store related documents.
// For example, create an index called elasticsearch_search_engine to store data of type cities_list
client.indices
  .create({
    index: "elasticsearch_search_engine",
  })
  .then((res, status) => {
    console.info("Created new index ", res);
  })
  .catch((err) => {
    console.error(err);
  });

let bulk = [];
cities.forEach((city) => {
  // There are two pushes to the array in the loop because the bulk API expects
  // an object containing the index definition first, and then the document you
  // want to index.
  bulk.push({
    index: {
      _index: "elasticsearch_search_engine",
      _type: "cities_list",
    },
  });
  bulk.push(city);
});

// Bulk index data
client
  .bulk({ body: bulk })
  .then((res) => {
    console.info("Successfully bulk imported %s records", cities.length);
  })
  .catch((err) => {
    console.error("Bulk import failed");
  });
