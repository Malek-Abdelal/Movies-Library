'use strict';

const express = require('express');
const movieData = require("./data.json");
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log("Welcome, this is my first server");
})

function Movie (title, posterPath, overview){
    this.title = title;
    this.posterPath = posterPath;
    this.overview = overview;
}

function ErrorHandler(status, responseText){
    this.status = status;
    this.responseText = responseText;
}

app.get('/', homeHandler);

function homeHandler (req, res) {
    let newMovie = new Movie(movieData.title, movieData.poster_path, movieData.overview); 
    res.json(newMovie);
}

app.get("/favorite", favoriteHandler);

function favoriteHandler(req, res){
    res.send("Welcome to Favorite Page");
}

function error404Handler(req, res){
    let error = new ErrorHandler(404, "page not found");
    res.status(404).send(error);
}

function error500Handler(req, res){
    let error = new ErrorHandler(500, "Sorry, something went wrong");
    res.status(500).send(error);
}

app.all('*', error404Handler);
app.all('*', error500Handler);