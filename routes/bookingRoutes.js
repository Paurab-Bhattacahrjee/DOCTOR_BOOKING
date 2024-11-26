const express = require('express');
const router = express.Router();
const { bookAppointment } = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, bookAppointment);

module.exports = router;
