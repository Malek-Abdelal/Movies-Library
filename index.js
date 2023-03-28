'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const {Client} = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
const PORT = process.env.PORT;
const DBPORT = process.env.DB_PORT;
let dbUser = process.env.DB_USER;
let dbPass = process.env.DB_PASS;
let apiKey = process.env.API_KEY;
let url = `postgres://${dbUser}:${dbPass}@localhost:${DBPORT}/dev`;
const client = new Client(url);


app.get('/trending', trendHandler);
app.get("/search", searchHandler);
app.get("/:movie_id/reviews", reviewsHandler);  //Some movies dosn't have a reviews, so try multiple IDs (Try for test, Id: 100)
app.get("/top_rated", topRatdeHandler);
app.post("/addMovie", addMovieHandler);
app.get("/getMovies", getMovieHandler);
app.put("/UPDATE/:id", updateMovieHandler);
app.delete("/DELETE/:id", deleteMovieHandler);
app.get("/getMovie/:id", getByIdHandler);
app.get('*', notFoundErrorHandler);
app.use(errorHandler); 


function trendHandler (req, res) {

    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`
    axios.get(url)
    .then((success) => {
        let movieInfo = success.data.results.map((result) => {
            let newMovie = new TrendMovie(result.id, result.title, result.release_date, result.poster_path, result.overview);
            return newMovie;
               })
        res.json(movieInfo);
    })
    .catch((error) => {
        errorHandler(error, req, res)});
}


function searchHandler(req, res){
    let searchFor = req.query.query;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${searchFor}&page=2`;
    axios.get(url)
    .then((success) => {
        let searchResult = success.data.results;
        res.json(searchResult);
    })
    .catch((error) => {
        errorHandler(error, req, res)} );
}
        
        
function reviewsHandler(req, res){
    let movieId = req.params['movie_id'];
    let url = `https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&language=en-US&page=1`;
    axios.get(url)
    .then((success) => {
        let reviewsResult = success.data.results.map((result) => {
            let newReviews = new Reviews(result.author, result.author_details.rating, result.content);
            return newReviews;
        })
        res.json(reviewsResult);
    })
    .catch((error) => {
        errorHandler(error, req, res)} );
}


function topRatdeHandler (req, res) {
    
    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`
    axios.get(url)
    .then((success) => {
        let movieInfo = success.data.results.map((result) => {
            let newMovie = new TopRated(result.adult, result.id, result.original_language, result.title, result.overview);
            return newMovie;
        })
        res.json(movieInfo);
    })
    .catch((error) => {
        errorHandler(error, req, res)} );
}


function addMovieHandler(req, res){

    let {lang, title, overview, comments} = req.body; 
    let values = [lang, title, overview, comments];
    let sql = `INSERT INTO movies (lang, title, overview, comments)
    VALUES ($1, $2, $3, $4) RETURNING *`;
    client.query(sql, values).then((result) => {
        res.status(201).json(result.rows);
    })
    .catch((error) => {
        errorHandler(error, req, res)});
}


function getMovieHandler(req, res){
    let sql = `SELECT * FROM movies`;
    client.query(sql).then((success) => {
        res.json(success.rows);
    })
    .catch((error) => {
        errorHandler(error, req, res)});
}


function updateMovieHandler(req, res){
    let {id} = req.params;
    let sql = `UPDATE movies
    SET comments = $1
    WHERE id = $2 RETURNING *`;
    let {comments} = req.body;
    let values = [comments, id];
    client.query(sql, values).then(success => {
        res.json(success.rows);
    })
    .catch((error) => {
        errorHandler(error, req, res)})

}


function deleteMovieHandler(req, res){

    let {id} = req.params;
    let sql = `DELETE FROM movies
    WHERE id = $1`;
    let values = [id];
    client.query(sql, values).then(() => {
        res.status(204).send("Successfully deleted");
    })
    .catch()
}


function getByIdHandler(req, res){

    let {id} = req.params;
    let sql = `SELECT lang, title, overview, comments
    FROM movies WHERE id = $1`;
    let values = [id];
    client.query(sql, values).then(success => {
        res.json(success.rows);
    })
    .catch()
}


function notFoundErrorHandler(req, res){
    res.status(404).send("Not Found");
}


function errorHandler(error, req, res){
    res.status(500).send(error);
}



function TrendMovie (id, title, releaseDate, posterPath, overview){
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.overview = overview;
}

function TopRated (adult, id, language, title, overview){
    this.adult = adult;
    this.id = id;
    this.language = language;
    this.title = title;
    this.overview = overview;
}

function Reviews (author, rating, content){
    this.author = author;
    this.rating= rating;
    this.content = content;
}


client.connect().then(() => {
    app.listen(PORT, () => {
        console.log("Welcome to my server");
    })  
})
.catch();
