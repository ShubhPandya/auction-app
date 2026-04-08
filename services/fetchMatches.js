require("dotenv").config();
const axios = require("axios");
const pool = require("../config/db");

async function fetchMatches() {
  try {
    const apiKey = process.env.API_KEY;

    const response = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`
    );

    const matches = response.data.data;

    for (let match of matches) {
      // Insert series
      if (match.series_id && match.series_name) {
        await pool.query(
          "INSERT INTO leagues(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
          [match.series_id, match.series_name]
        );
      }

      // Insert teams
      if (match.teamInfo) {
        for (let team of match.teamInfo) {
          await pool.query(
            "INSERT INTO teams(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
            [team.name, team.name]
          );
        }
      }

      // Insert match
      await pool.query(
        "INSERT INTO matches(id, team1_id, team2_id, match_date, status) VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING",
        [
          match.id,
          match.teamInfo?.[0]?.name || "Team1",
          match.teamInfo?.[1]?.name || "Team2",
          new Date(),
          match.status
        ]
      );
    }

    console.log("Matches, series, teams inserted into database");
  } catch (err) {
    console.error(err);
  }
}

module.exports = fetchMatches;