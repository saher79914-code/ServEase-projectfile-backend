const express = require('express');

const router = express.Router();

const {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleService,
} = require('../controllers/serviceController');


// GET
router.get('/', getServices);

// CREATE
router.post('/', createService);

// UPDATE
router.put('/:id', updateService);

// DELETE
router.delete('/:id', deleteService);

// TOGGLE ACTIVE
router.put('/:id/toggle', toggleService);

module.exports = router;