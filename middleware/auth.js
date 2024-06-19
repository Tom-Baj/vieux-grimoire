// Importing a modul
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract the token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Check the token
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    }   catch (error) {
        res.status(401).json({ error });
    }
};