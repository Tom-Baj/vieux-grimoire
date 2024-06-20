// Importing modules
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const { route } = require('./book');

// Create routes for authentification
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;