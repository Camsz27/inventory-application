var Category = require('../models/category');
var Instrument = require('../models/instrument');
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
exports.category_create_post = function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }

    // Create new category
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      image: '/images/' + req.file.filename,
    });

    // Save category in database
    category.save(function (err) {
      if (err) {
        return next(err);
      }
      // Creation successful redirect to category page
      res.redirect(category.url);
    });
  });
};

// [
//   body('name', 'Invalid name').trim().isLength({ min: 1, max: 100 }).escape(),
//   body('description', 'Invalid description')
//     .trim()
//     .isLength({ min: 1, max: 200 })
//     .escape(),
//   body('image', 'Invalid image').trim().isLength({ min: 1, max: 100 }).escape(),

//   (req, res, next) => {
//     const errors = validationResult(req);

//     // Handle errors
//     if (!errors.isEmpty()) {
//       res.render('category_form', {
//         title: 'Add a New Category',
//         category: req.body,
//         errors: errors.array(),
//         but: 'Create',
//       });
//       return;
//     }

//     //Create new category
//     var category = new Category({
//       name: req.body.name,
//       description: req.body.description,
//       image: req.body.image,
//     });

//     category.save(function (err) {
//       if (err) {
//         return next(err);
//       }
//       // Creation successful, redirect to category detail
//       res.redirect(category.url);
//     });
//   },
// ];

// Display form to update a category
exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id, function (err, result) {
    if (err) {
      return next(err);
    }
    res.render('category_form', {
      title: 'Update Category',
      but: 'Update',
      category: result,
    });
  });
};

// Handle user input to update the category
exports.category_update_post = function (req, res, err) {
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }

    // Create new category to replace the old one
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      image: '/images/' + req.file.filename,
      _id: req.params.id,
    });

    // Replace category in the server
    Category.findByIdAndUpdate(
      req.params.id,
      category,
      {},
      function (err, theCategory) {
        if (err) {
          return next(err);
        }
        res.redirect(theCategory.url);
      }
    );
  });
};
// [
//   body('name', 'Invalid name').trim().isLength({ min: 1, max: 100 }).escape(),
//   body('description', 'Invalid description')
//     .trim()
//     .isLength({ min: 1, max: 200 })
//     .escape(),
//   body('image', 'Invalid image').trim().isLength({ min: 1, max: 100 }),

//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render('category_form', {
//         title: 'Update Category',
//         but: 'Update',
//         category: req.body,
//         errors: errors.array(),
//       });
//       return;
//     }

//     // Update the category
//     var category = new Category({
//       name: req.body.name,
//       description: req.body.description,
//       image: req.body.image,
//       _id: req.params.id,
//     });
//     Category.findByIdAndUpdate(
//       req.params.id,
//       category,
//       {},
//       function (err, theCategory) {
//         if (err) {
//           return next(err);
//         }
//         res.redirect(theCategory.url);
//       }
//     );
//   },
// ];

exports.category_delete_get = function (req, res, next) {
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
      res.render('category_delete', {
        title: 'Delete Category',
        category: result.category,
        instruments: result.instruments,
      });
    }
  );
};

exports.category_delete_post = function (req, res) {
  Category.findByIdAndRemove(req.params.id, {}, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/inventory/category');
  });
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
