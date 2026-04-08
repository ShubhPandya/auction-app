require("dotenv").config();
const axios = require("axios");

const api = axios.create({
  baseURL: "https://cricbuzz-cricket.p.rapidapi.com",
  headers: {
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": process.env.RAPID_API_HOST,
  },
});

module.exports = api;