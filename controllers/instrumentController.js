var Instrument = require('../models/instrument');
const { body, validationResult } = require('express-validator');

exports.instrument_create_get = function (req, res) {
  res.send('Not implemented: instrument create get');
};
exports.instrument_create_post = function (req, res) {
  res.send('Not implemented: instrument create post');
};
exports.instrument_update_get = function (req, res) {
  res.send('Not implemented: instrument update get');
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
exports.instrument_detail = function (req, res) {
  Instrument.findById(req.params.id, function (err, result) {
    if (err) {
      return next(err);
    }
    console.log(result);
    res.render('instrument_detail', { title: result.name, data: result });
  });
};
exports.instrument_list = function (req, res) {
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
