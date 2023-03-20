'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(cors());
const PORT = process.env.PORT;
let apiKey = process.env.API_KEY;


app.get('/trending', trendHandler);
app.get("/search", searchHandler);
app.get("/:movie_id/reviews", reviewsHandler);  //Some movies dosn't have a reviews, so try multiple IDs (Try for test, Id: 100)
app.get("/top_rated", topRatdeHandler);



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
        (error.response.status === 404) ? res.status(404).json("The requested page doesn't exist."): (error.response.status === 500) ? res.status(500).json("Internal Server Error."): console.log(error)} );
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
        (error.response.status === 404) ? res.status(404).json("The requested page doesn't exist."): (error.response.status === 500) ? res.status(500).json("Internal Server Error."): console.log(error)} );
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
        (error.response.status === 404) ? res.status(404).json("The requested page doesn't exist."): (error.response.status === 500) ? res.status(500).json("Internal Server Error."): console.log(error)} );
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
        (error.response.status === 404) ? res.status(404).json("The requested page doesn't exist."): (error.response.status === 500) ? res.status(500).json("Internal Server Error."): console.log(error)} );
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


app.listen(PORT, () => {
    console.log("Welcome to my server");
})