const express = require("express");
const pool = require("./config/db");
const fetchMatches = require("./services/fetchMatches");
const fetchSeries = require("./services/fetchSeries");
const fetchTeamsByLeague = require("./services/fetchTeamsByLeague");
const testApi = require("./services/testCricbuzz");

require("./cron/cronJobs");

const app = express();

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.send("Database error");
  }
});

app.get("/fetch-matches", async (req, res) => {
  await fetchMatches();
  res.send("Matches fetched and stored");
});

app.get("/fetch-series", async (req, res) => {
  await fetchSeries();
  res.send("Series fetched and stored");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/fetch-teams/:seriesId", async (req, res) => {
  const seriesId = req.params.seriesId;
  await fetchTeamsByLeague(seriesId);
  res.send("Teams fetched for league");
});

app.get("/test-api", async (req, res) => {
  await testApi();
  res.send("API Tested");
});