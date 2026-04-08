require("dotenv").config();
const axios = require("axios");
const pool = require("../config/db");

async function fetchSeries() {
  try {
    const apiKey = process.env.API_KEY;

    for (let offset = 0; offset < 200; offset += 25) {
      const response = await axios.get(
        `https://api.cricapi.com/v1/series?apikey=${apiKey}&offset=${offset}`
      );

      const seriesList = response.data.data;

      if (!seriesList) break;

      for (let series of seriesList) {
        await pool.query(
          "INSERT INTO leagues(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
          [series.id, series.name]
        );
      }
    }

    console.log("Series inserted into database");
  } catch (err) {
    console.error(err);
  }
}

module.exports = fetchSeries;