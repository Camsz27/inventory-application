#! /usr/bin/env node

console.log(
  'This script populates some categories and instruments to the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/projectname?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async');
var Instrument = require('./models/instrument');
var Category = require('./models/category');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var instruments = [];
var categories = [];

function categoryCreate(name, description, image, cb) {
  categoryDetail = { name: name, description: description, image: image };

  var category = new Category(categoryDetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category);
    cb(null, category);
  });
}

function instrumentCreate(
  name,
  brand,
  category,
  price,
  number_in_stock,
  image,
  cb
) {
  instrumentDetail = {
    name: name,
    brand: brand,
    category: category,
    price: price,
    number_in_stock: number_in_stock,
    image: image,
  };

  var instrument = new Instrument(instrumentDetail);
  instrument.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Instrument: ' + instrument);
    instruments.push(instrument);
    cb(null, instrument);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          'Guitars',
          'Fretted musical instrument that typically has six strings',
          '/images/guitar.jpeg',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Basses',
          'Musical instrument that produces tones in the low-pitched range C4 - C2',
          '/images/bass.webp',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Drums',
          'Musical instrument that is sounded by being struck or scraped by a beater',
          '/images/drums.webp',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Keyboards',
          'Musical instrument played using a row of levers which are pressed by the fingers',
          '/images/keyboard.webp',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Amps',
          'An electronic device that can increase the power of a signal',
          '/images/amp.webp',
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createInstruments(cb) {
  async.parallel(
    [
      function (callback) {
        instrumentCreate(
          "Gibson Les Paul Standard '60s Electric Guitar",
          'Gibson',
          categories[0],
          2699.0,
          7,
          '/images/guitar1.webp',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Gibson Les Paul Traditional Pro V Flame Top Electric Guitar',
          'Gibson',
          categories[0],
          2599.0,
          18,
          '/images/guitar2.webp',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Fender American Ultra Jazz Bass V 5-String Maple Fingerboard',
          'Fender',
          categories[1],
          2199.99,
          3,
          '/images/bass1.webp',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Yamaha Stage Custom Birch 5-Piece Shell Pack with 20" Bass Drum Cranberry Red',
          'Yamaha',
          categories[2],
          709.99,
          4,
          '/images/drums1.webp',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Yamaha P-45LXB Digital Piano with Stand and Bench',
          'Yamaha',
          categories[3],
          679.99,
          12,
          '/images/keyboard1.jpeg',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Roland RD-2000 Digital Stage Piano',
          'Roland',
          categories[3],
          2699.99,
          8,
          '/images/keyboard2.webp',
          callback
        );
      },
      function (callback) {
        instrumentCreate(
          'Fender Mustang LT25 25W 1x8 Guitar Combo Amp',
          'Fender',
          categories[4],
          179.99,
          15,
          '/images/amp1.jpeg',
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createInstruments],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('Instruments: ' + createInstruments);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
