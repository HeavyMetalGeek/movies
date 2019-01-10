const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Movie = require('../models/movie');

const MoviesController = require('../controllers/movies');

// Movies collection
router.get('/', MoviesController.movies_get_many);
router.get('/add', (req, res, next) => {res.render('movies/add')});
router.post('/', MoviesController.movies_post);

// Individual movies
router.get('/:movieId', MoviesController.movies_get_one);
router.patch('/:movieId', MoviesController.movies_patch_one);
router.delete('/:movieId', MoviesController.movies_delete_one);

module.exports = router;