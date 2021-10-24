var Category = require('../models/category');
var Instrument = require('../models/instrument');
const { body, validationResult } = require('express-validator');
const async = require('async');

// Displays home page, shows number of instruments available
exports.index = function (req, res) {
  async.parallel(
    {
      categories_num: function (callback) {
        Category.countDocuments({}, callback);
      },
      instrument_num: function (callback) {
        Instrument.countDocuments({}, callback);
      },
      inventory_num: function (callback) {
        Instrument.aggregate(
          [{ $group: { _id: null, total: { $sum: '$number_in_stock' } } }],
          callback
        );
      },
    },
    function (err, result) {
      res.render('index', {
        title: 'Inventory Overview',
        error: err,
        data: result,
      });
    }
  );
};

// Display form to create a new category
exports.category_create_get = function (req, res, next) {
  res.render('category_form', { title: 'Add a New Category', but: 'Create' });
};

// Handles user input to create a new category
exports.category_create_post = [
  body('name', 'Invalid name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description', 'Invalid description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),
  body('image', 'Invalid image').trim().isLength({ min: 1, max: 100 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    // Handle errors
    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Add a New Category',
        category: req.body,
        errors: errors.array(),
        but: 'Create',
      });
      return;
    }

    //Create new category
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
    });

    category.save(function (err) {
      if (err) {
        return next(err);
      }
      // Creation successful, redirect to category detail
      res.redirect(category.url);
    });
  },
];

exports.category_update_get = function (req, res, next) {
  res.send('Not implemented category update get');
};
exports.category_update_post = function (req, res) {
  res.send('Not implemented category update post');
};
exports.category_delete_get = function (req, res, next) {
  res.send('Not implemented category delete get');
};
exports.category_delete_post = function (req, res) {
  res.send('Not implemented category delete post');
};

// Display instruments in a category
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      instruments: function (callback) {
        Instrument.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, result) {
      if (err) {
        return next(err);
      }
      res.render('category_detail', {
        title: result.category.name,
        category: result.category,
        instruments: result.instruments,
      });
    }
  );
};

//Display list of categories
exports.category_list = function (req, res, next) {
  Category.find({}).exec(function (err, category_list) {
    if (err) {
      return next(err);
    }
    res.render('category_list', {
      title: 'Categories',
      categories: category_list,
    });
  });
};
