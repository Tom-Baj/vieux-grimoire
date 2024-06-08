const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/book');

router.get('/', stuffCtrl.getAllBooks);
router.get('/:id', stuffCtrl.getOneBook);

router.get('/bestrating', (req, res, next) => {
    console.log(req.body);
    res.status(200).json({
      message: 'Objet trouvé !'
    });
  }
);

router.post('/', stuffCtrl.createBook);
router.put('/:id', stuffCtrl.updateBook);
router.delete('/:id', stuffCtrl.deleteBook);

router.post('/:id/rating', (req, res, next) => {
    console.log(req.body);
    res.status(200).json({
      message: 'Objet trouvé !'
    });
  }
);

module.exports = router;