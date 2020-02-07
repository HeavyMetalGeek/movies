const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Movie = require('../models/movie');

const MoviesController = require('../controllers/movies');

// Movies collection
router.get('/', MoviesController.movies_get_many);
router.get('/add', MoviesController.movies_add);
router.post('/', MoviesController.movies_post);

// Individual movies
router.get('/edit/:id', MoviesController.movies_edit);
router.patch('/:movieId', MoviesController.movies_patch);
router.delete('/:movieId', MoviesController.movies_delete);

module.exports = router;