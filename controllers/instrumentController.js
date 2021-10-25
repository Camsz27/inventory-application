var Instrument = require('../models/instrument');
var Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const async = require('async');
const multer = require('multer');
const path = require('path');

// Select location to store the images
const storage = multer.diskStorage({
  destination: './public/images/',
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Upload image that is entered in the form
const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    callback(null, true);
  },
}).single('image');

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
exports.instrument_create_post = function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }

    // Create new instrument
    var instrument = new Instrument({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      image: '/images/' + req.file.filename,
    });

    // Save instrument in database
    instrument.save(function (err) {
      if (err) {
        return next(err);
      }
      // Creation successful redirect to instrument page
      res.redirect(instrument.url);
    });
  });
};
//[
// body('name', 'Invalid name').trim().isLength({ min: 1, max: 100 }).escape(),
// body('brand', 'Invalid brand').trim().isLength({ min: 1, max: 100 }).escape(),
// body('price', 'Invalid price')
//   .trim()
//   .isFloat({ min: 1, max: 100000 })
//   .escape(),
// body('number_in_stock', 'Invalid stock number')
//   .trim()
//   .isInt({ min: 1, max: 1000 })
//   .escape(),
// body('image', 'Invalid brand').trim().isLength({ min: 1, max: 100 }).escape(),

// (req, res, next) => {
//   const errors = validationResult(req);
//   upload(req, res, function (error) {
//     if (error) {
//       return next(error);
//     }
//     console.log(req.file);
//   });
//   // In case of error return to form for correction
//   if (!errors.isEmpty()) {
//     console.log(errors);
//     Category.find({}).exec(function (err, result) {
//       if (err) {
//         return next(err);
//       }
//       res.render('instrument_form', {
//         title: 'Add a New Instrument',
//         categories: result,
//         instrument: req.body,
//         selected_category: req.body.category,
//         errors: errors.array(),
//         but: 'Create',
//       });
//     });
//     return;
//   }

//   // Create new instrument
//   var instrument = new Instrument({
//     name: req.body.name,
//     brand: req.body.brand,
//     category: req.body.category,
//     price: req.body.price,
//     number_in_stock: req.body.number_in_stock,
//     image: req.body.image,
//   });

//   instrument.save(function (err) {
//     if (err) {
//       return next(err);
//     }
//     // Creation successful, redirect to instrument detail
//     res.redirect(instrument.url);
//   });
// },
// ];

// Display form to update an instrument
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

// Handle user input to update instrument
exports.instrument_update_post = [
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
  body('image', 'Invalid image').trim().isLength({ min: 1, max: 100 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Category.find({}).exec(function (err, result) {
        if (err) {
          return next(err);
        }
        res.render('instrument_form', {
          title: 'Update Instrument',
          categories: result,
          instrument: req.body,
          selected_category: req.body.category,
          errors: errors.array(),
          but: 'Update',
        });
      });
      return;
    }
    var instrument = new Instrument({
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      image: req.body.image,
      _id: req.params.id,
    });
    Instrument.findByIdAndUpdate(
      req.params.id,
      instrument,
      {},
      function (err, theInstrument) {
        if (err) {
          return next(err);
        }
        res.redirect(theInstrument.url);
      }
    );
  },
];

// Delete selected instrument
exports.instrument_delete = function (req, res) {
  Instrument.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/inventory/instrument');
  });
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
