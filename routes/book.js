const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

const stuffCtrl = require('../controllers/book');

router.get('/', stuffCtrl.getAllBooks);
router.get('/:id', stuffCtrl.getOneBook);
router.get('/bestrating', stuffCtrl.getBestRating);
router.post('/', auth, multer, stuffCtrl.createBook);
router.put('/:id', auth, multer, stuffCtrl.updateBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.post('/:id/rating', auth, stuffCtrl.createRating);

module.exports = router;