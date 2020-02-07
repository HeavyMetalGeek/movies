const mongoose = require('mongoose');
const Movie = require('../models/movie');

exports.movies_get_many = (req, res, next) => {
  // const movie = new Movie({
  //   title: req.body.title,
  //   genre: req.body.genre,
  //   year: req.body.year,
  //   rating: req.body.rating
  // });

  // const titleCondition = movie.title ? movie.title : {$exists:true};
  // const yearCondition = movie.year ? movie.year : {$exists:true};
  // const ratingCondition = movie.rating ? movie.rating : {$exists:true};
  // const genreCondition = movie.genre ? movie.genre : {$exists:true};
  let titleCondition;
  if (req.query.search) {
    titleCondition = new RegExp(escapeRegex(req.query.search), 'gi');
  } else {
    titleCondition = {$exists: true};
  }

  
  Movie.find({title: titleCondition})
    // title: titleCondition, 
    // year: yearCondition, 
    // rating: ratingCondition,
    // genre: genreCondition})
    .sort({title: 'asc'})
    .select('_id title genre year rating')
    .exec()
    .then(result => {
      res.render('movies/index', {
        movies:result
      });
    })
    // .then(result => {
    //   res.status(200).json({
    //     message: `${result.length} movies found`,
    //     query: {
    //       title: movie.title, 
    //       year: movie.year,
    //       rating: movie.rating,
    //       genre: movie.genre
    //     },
    //     result: result
    //   })
    // })
    .catch(err => {
      res.status(500).json({
        error: err
      })
      console.log(err);
    });
}

exports.movies_post = (req, res, next) => {
  console.log(req.body);
  if (!req.body.title || !req.body.year || !req.body.rating || !req.body.genre) {
    return res.render('ideas/add', {
      title: res.body.title,
      year: res.body.year,
      rating: res.body.rating,
      genre: res.body.genre
    })
  } else {
    const movie = new Movie({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      genre: req.body.genre,
      year: req.body.year,
      rating: req.body.rating
    });
    const queryMsg = {
      process: '',
      query: '',
      result: '',
    }
    const responseMsg = {
      message: '',
      process: ''
    }
    // Ensure entry doesn't already exist
    Movie.findOne({title: movie.title, year: movie.year})
      .exec()
      .then(result => {
        queryMsg.process = 'FIND_ONE';
        queryMsg.query = {title: movie.title, year: movie.year};
        queryMsg.result = result;
        console.log(queryMsg);
        if (!result) {
          return movie.save();
        } else {
          return null;
        }
      })
      .then(result => {
        responseMsg.process = 'POST';
        if (result) {
          responseMsg.message = `${result.title} was created successfully`;
          responseMsg.movie = movie;
          console.log(responseMsg);
          // res.status(201).json(responseMsg);
          req.flash('success_msg', responseMsg.message);
          res.redirect('/movies/add');
        } else {
          responseMsg.message = `${movie.title} already exists`;
          responseMsg.movie = movie;
          console.log(responseMsg);
          // res.status(200).json(responseMsg);
          req.flash('error_msg', responseMsg.message)
          res.redirect('/movies/add');
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  }
}

exports.movies_get_one = (req, res, next) => {
  const id = req.params.movieId;
  const queryMsg = {
    process: 'FIND_BY_ID',
    query: {id:id},
  }
  Movie.findById(id)
    .select('_id title genre year rating')
    .then(result => {
      queryMsg.result = result;
      console.log(queryMsg);
      if(result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({message: 'Movie ID not found'});
      }
    })
    .catch(err => {
      res.status(500).json({error: err});
    });
}

exports.movies_patch_one = (req, res, next) => {
  const id = req.params.movieId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Movie.updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

exports.movies_delete_one = (req, res, next) => {
  const id = req.params.movieId;
  Movie.deleteOne({_id:id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Movie deleted',
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

/* UI ONLY functions */
exports.movies_add = (req, res, next) => {
  res.render('movies/add');
}

exports.movies_edit = (req, res, next) => {
  Movie.findOne({_id: req.params.id})
    .then(movie => {
      res.render('movies/edit', {
        movie:movie
      });
    })
}

exports.movies_patch = (req, res, next) => {
  const id = req.params.movieId;
  const updateOps = {};
  for (const ops in req.body) {
    updateOps[ops] = req.body[ops];
  }
  Movie.updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
      console.log(result);
      req.flash('success_msg', `${req.body.title} successfully changed.`);
      res.redirect('/movies');
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

exports.movies_delete = (req, res, next) => {
  const id = req.params.movieId;
  Movie.deleteOne({_id:id})
    .exec()
    .then(result => {
      req.flash('success_msg', `${req.body.title} successfully deleted.`);
      res.redirect('/movies');
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};