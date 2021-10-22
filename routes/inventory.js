var express = require('express');
var router = express.Router();

// Require controller modules
var category_controller = require('../controllers/categoryController');
var instrument_controller = require('../controllers/instrumentController');

// Category routes

// Requests for creating a category
router.get('/category/create', category_controller.category_create_get);
router.post('/category/create', category_controller.category_create_post);

// Requests for updating a category
router.get('/category/:id/update', category_controller.category_update_get);
router.post('/category/:id/update', category_controller.category_update_post);

// Requests for deleting a category
router.get('/category/:id/delete', category_controller.category_delete_get);
router.post('/category/:id/delete', category_controller.category_delete_post);

// Request for showing a category
router.get('/category/:id', category_controller.category_detail);

// Request for showing list of categories
router.get('/category', category_controller.category_list);

// Instrument routes

router.get('/', instrument_controller.index);

// Requests for creating an instrument
router.get('/instrument/create', instrument_controller.instrument_create_get);
router.post('/instrument/create', instrument_controller.instrument_create_post);

// Requests for updating an instrument
router.get(
  '/instrument/:id/update',
  instrument_controller.instrument_update_get
);
router.post(
  '/instrument/:id/update',
  instrument_controller.instrument_update_post
);

// Requests for deleting an instrument
router.get(
  '/instrument/:id/delete',
  instrument_controller.instrument_delete_get
);
router.post(
  '/instrument/:id/delete',
  instrument_controller.instrument_delete_post
);

// Request for showing an instrument
router.get('/instrument/:id', instrument_controller.instrument_detail);

// Request for showing list of instruments
router.get('/instrument', instrument_controller.instrument_list);

module.exports = router;
