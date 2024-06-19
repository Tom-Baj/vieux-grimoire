// Importing all modules
const { Code } = require('mongodb');
const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const e = require('express');


exports.getAllBooks = (req, res, next) => {
    // Find all books
    Book.find()
        .then(books => res.status(200).json(books)) // Return all books
        .catch(error => res.status(400).json({ error }));
    };

exports.getOneBook = (req, res, next) => {
    // Find only one book by ID
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book)) // Return the book
        .catch(error => res.status(404).json({ error }));
    };

exports.getBestRating = (req, res, next) => {
    // Find the 3 best rated books
    Book.find().sort({ averageRating: -1 }).limit(3) // Sort the books
        .then(books => res.status(200).json(books)) // Return 3 books
        .catch(error => res.status(400).json({ error }));
};
    

exports.createRating = (req, res, next) => {
    // Create a new rating for a book
    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
    };

    // Check if the range of the rating it's true
    if (newRating.grade < 0 || newRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 !' });
    }

    // Find the book by this ID
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Check if the user has already rated this book
            const userHasRated = book.ratings.some(rating => rating.userId === req.auth.userId);
            if (userHasRated) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre !' });
            }
            book.ratings.push(newRating); // Add the new rating to the book
            const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;
            return book.save()
                .then(updatedBook => {
                    res.status(200).json(updatedBook);
                }) // Return the book with the new rating
                .catch(error => {
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.createBook = async (req, res, next) => {
    // Create a new book
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const timestamp = new Date().toISOString(); // Generate a time for the image file
    const ref = `${timestamp}.webp`; // Create image with the extension .webp 
    await sharp(req.file.path)
        .webp({ quality: 80 }) // Adjust the quality of the image
        .toFile(`images/${ref}`); // Save the converted image in the folder
    fs.unlink(`images/${req.file.filename}`, () => {
        // Delete the original image
        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
        });

        book.save() // Save the new book
        .then(() => {
            res.status(201).json({ book });
        }) // Return the new book
        .catch(error => res.status(400).json({ error }));
    });
};

exports.modifyBook = (req, res, next) => {
    // Modify a existing book
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Check if the user can modify the book
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !'});
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié !'})) // Modify the book
                .catch(error => res.status(401).json({ error }));
            }
        });
};

exports.deleteBook = (req, res, next) => {
    // Delete an existing book
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Check if the user can delete the book
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // Delete the image
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !' })) // Delete the book
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};