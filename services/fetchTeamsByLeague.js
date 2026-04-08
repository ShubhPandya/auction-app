require("dotenv").config();
const axios = require("axios");
const pool = require("../config/db");

async function fetchTeamsByLeague(seriesId) {
  try {
    const apiKey = process.env.API_KEY;

    const response = await axios.get(
      `https://api.cricapi.com/v1/series_info?apikey=${apiKey}&id=${seriesId}`
    );

    const teams = response.data.data.teams;

    for (let team of teams) {
      await pool.query(
        "INSERT INTO teams(id, name, league_id) VALUES($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        [team.id, team.name, seriesId]
      );
    }

    console.log("Teams inserted for league:", seriesId);
  } catch (err) {
    console.error(err);
  }
}

module.exports = fetchTeamsByLeague;