const { Code } = require('mongodb');
const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');
const e = require('express');


exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
    };

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
    };

exports.getBestRating = (req, res, next) => {
    Book.find({ averageRating: { $gte: 3 } })
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
    }

/* 
    - Créer une note
    - Note entre 0 - 5
    - Vérifier si l'utilisateur a déjà noté le livre
    - Vérifier si la note est correcte
    - Mettre à jour la note moyenne

*/

exports.createRating = (req, res, next) => {
    const rating = JSON.parse(req.body.newRating);
    //Vérifie le corp de la requête
    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
    };

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.ratings.userId === req.auth.userId) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre !' });
            } else if (newRating.grade < 0 || newRating.grade > 5) {
                return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 !' });
            } else {
                Book.updateOne({ _id: req.params.id }, { $push: { ratings: newRating } })
                    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                    .catch(error => res.status(400).json({ error }));
            }
        });
    };

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    const timestamp = new Date().toISOString();
    const ref = `${timestamp}.webp`;
    await sharp(req.file.path)
        .webp({ quality: 80 })
        .toFile(`images/${ref}`);
    fs.unlink
    
    book.save()
        .then(() => {
            res.status(201).json({ book });
        })
        .catch(error => res.status(400).json({ error }));
    };

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !'});
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                .catch(error => res.status(401).json({ error }));
            }
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId !== req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé !' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};