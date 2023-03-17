'use strict';

const express = require('express');
const movieData = require("./data.json");
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log("Welcome, this is my first server");
})

app.get('/', homeHandler);

function homeHandler (req, res) {
    let newMovie = new Movie(movieData); 
    res.json(newMovie.movieObj);
}

app.get("/favorite", favoriteHandler);

function Movie (movieObj){
    this.movieObj = movieObj;
}

function favoriteHandler(req, res){
    res.send("Welcome to Favorite Page");
}

function error404Handler(req, res){
    res.status(404).send("page not found");
}

function error500Handler(req, res){
    res.status(500).send("Sorry, something went wrong");
}

app.all('*', error404Handler);
app.all('*', error500Handler);