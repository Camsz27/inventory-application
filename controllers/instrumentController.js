var Instrument = require('../models/instrument');
var Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Display form to create a new instrument
exports.instrument_create_get = function (req, res, next) {
  Category.find({}).exec(function (err, result) {
    if (err) {
      return next(err);
    }
    res.render('instrument_form', {
      title: 'Add a New Instrument',
      categories: result,
      but: 'Create',
    });
  });
};

// Handle user input to create a new instrument
exports.instrument_create_post = [
  body('name', 'Invalid name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('brand', 'Invalid brand').trim().isLength({ min: 1, max: 100 }).escape(),
  body('price', 'Invalid price')
    .trim()
    .isFloat({ min: 1, max: 100000 })
    .escape(),
  body('number_in_stock', 'Invalid stock number')
    .trim()
    .isInt({ min: 1, max: 1000 })
    .escape(),
  body('image', 'Invalid brand').trim().isLength({ min: 1, max: 100 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    // In case of error return to form for correction
    if (!errors.isEmpty()) {
      Category.find({}).exec(function (err, result) {
        if (err) {
          return next(err);
        }
        res.render('instrument_form', {
          title: 'Add a New Instrument',
          categories: result,
          instrument: req.body,
          selected_category: req.body.category,
          errors: errors.array(),
          but: 'Create',
        });
      });
      return;
    }

    // Create new instrument
    var instrument = new Instrument({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      image: req.body.image,
    });

    instrument.save(function (err) {
      if (err) {
        return next(err);
      }
      // Creation successful, redirect to instrument detail
      res.redirect(instrument.url);
    });
  },
];

exports.instrument_update_get = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      instrument: function (callback) {
        Instrument.findById(req.params.id).populate('category').exec(callback);
      },
    },
    function (err, result) {
      if (err) {
        return next(err);
      }
      if (result.instrument == null) {
        var err = new Error('Instrument not found');
        err.status = 404;
        return next(err);
      }
      res.render('instrument_form', {
        title: 'Update Instrument',
        categories: result.categories,
        instrument: result.instrument,
        selected_category: result.instrument.category._id.toString(),
        but: 'Update',
      });
    }
  );
};

exports.instrument_update_post = function (req, res) {
  res.send('Not implemented: instrument update post');
};

exports.instrument_delete_get = function (req, res) {
  res.send('Not implemented: instrument delete get');
};

exports.instrument_delete_post = function (req, res) {
  res.send('Not implemented: instrument delete post');
};

// Display detail for a given instrument
exports.instrument_detail = function (req, res, next) {
  Instrument.findById(req.params.id, function (err, result) {
    if (err) {
      return next(err);
    }
    res.render('instrument_detail', { title: result.name, data: result });
  });
};

// Display list of instruments available
exports.instrument_list = function (req, res, next) {
  Instrument.find({}).exec(function (err, instrument_list) {
    if (err) {
      return next(err);
    }
    res.render('instrument_list', {
      title: 'Instruments',
      instruments: instrument_list,
    });
  });
};
