// Importing the modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.signup = (req, res, next) => {
    // User signup
    bcrypt.hash(req.body.password, 10) // Hash the password
        .then(hash => {
            const user = new User({
                email: req.body.email, // Insert the email in the request body
                password: hash // Insert the hash password
            });
            user.save() // Register the new user in the database
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // User login
    User.findOne({ email: req.body.email }) // Find the user in the database
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur où mot de passe incorrecte !'});
            }
            bcrypt.compare(req.body.password, user.password) // Compare the password
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Utilisateur où mot de passe incorrecte !'});
                    }
                    res.status(200).json({
                        userId: user._id, // Return the user id
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET', // Create a token
                            { expiresIn: '24h'} // Token expiration time
                        ),
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

