var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const API_KEY = process.env.API_KEY;
const User = require("../models/user");

router.post("/search", (req, res) => {
  if (req.body.cityName === "") {
    return;
  }
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`
  )
    .then((response) => response.json())
    .then((apiData) => {
      if (apiData.weather) {
        res.json({
          result: true,
          weather: {
            cityName: apiData.name,
            main: apiData.weather[0].main,
            description: apiData.weather[0].description,
            tempMin: Math.floor(apiData.main.temp_min),
            tempMax: Math.floor(apiData.main.temp_max),
            id: apiData.id,
          },
        });
      } else {
        res.json({
          result: false,
          error: "City not found",
        });
      }
    });
});

router.put("/addFav", (req, res) => {
  User.findOne({ token: req.body.token }).then((userData) => {
    if (userData.favorites.includes(req.body.id)) {
      User.updateOne(
        { token: req.body.token },
        { favorites: userData.favorites.filter((e) => e === req.body.id) }
      ).then(() => {
        res.json({ result: false, message: "City removed from favorites" });
      });
    } else {
      User.updateOne(
        { token: req.body.token },
        { $push: { favorites: req.body.id } }
      ).then(() => {
        res.json({ result: true, message: "City added to favorites" });
      });
    }
  });
});

router.post("/fetchFav",async  (req, res) => {
  const favCitiesWeather = [];
 await User.findOne({ token: req.body.token }).then((userData) => {
    console.log(userData.favorites)
    if (userData.favorites) {
      userData.favorites.forEach(async (cityId) => {
        await fetch(
          `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${API_KEY}`
        )
          .then((response) => response.json())
          .then((cityData) => {
            favCitiesWeather.push({
              cityName: cityData.name,
              main: cityData.weather[0].main,
              description: cityData.weather[0].description,
              tempMin: Math.floor(cityData.main.temp_min - 273.15),
              tempMax: Math.floor(cityData.main.temp_max - 273.15),
              id: cityData.id,
            });
          });
        if (favCitiesWeather.length === userData.favorites.length) {
           res.json({ result: true, data: favCitiesWeather });
        }
      });
    } else {
      res.json({
        result: false,
        error: "No favorites associated with this account",
      });
    }
  });
});

module.exports = router;
