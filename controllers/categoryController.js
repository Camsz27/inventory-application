var Category = require('../models/category');
var Instrument = require('../models/instrument');
const { body, validationResult } = require('express-validator');
const async = require('async');

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

exports.category_create_get = function (req, res) {
  res.send('Not implemented category create get');
};
exports.category_create_post = function (req, res) {
  res.send('Not implemented category create post');
};
exports.category_update_get = function (req, res) {
  res.send('Not implemented category update get');
};
exports.category_update_post = function (req, res) {
  res.send('Not implemented category update post');
};
exports.category_delete_get = function (req, res) {
  res.send('Not implemented category delete get');
};
exports.category_delete_post = function (req, res) {
  res.send('Not implemented category delete post');
};
exports.category_detail = function (req, res) {
  res.send('Not implemented category detail');
};
exports.category_list = function (req, res) {
  Category.find({}).exec(function (err, category_list) {
    if (err) {
      return next(err);
    }
    res.render('category_list', {
      title: 'Category List',
      categories: category_list,
    });
  });
};
