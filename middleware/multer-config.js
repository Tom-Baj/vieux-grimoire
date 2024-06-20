// Importing a modul
const multer = require('multer');


const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
    }; // Define the MIME_TYPES object

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        // Change space for undescore
        const fileName = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, fileName + Date.now() + '.' + extension); // Add a times to the file name
    }
});


 
module.exports = multer({ storage }).single('image');