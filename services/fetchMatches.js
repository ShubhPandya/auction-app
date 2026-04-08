require("dotenv").config();
const api = require("./cricbuzzApi");   // ✅ use your unified API
const pool = require("../config/db");

async function fetchMatches() {
  try {
    // 🔥 Call Cricbuzz API (RapidAPI)
    const response = await api.get("/matches/list");

    const typeMatches = response.data?.typeMatches || [];

    for (const type of typeMatches) {
      for (const series of type.seriesMatches || []) {
        const seriesData = series.seriesAdWrapper;

        if (!seriesData) continue;

        const seriesId = seriesData.seriesId;
        const seriesName = seriesData.seriesName;

        // ✅ Insert league (series)
        await pool.query(
          "INSERT INTO leagues(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
          [seriesId, seriesName]
        );

        for (const matchWrapper of seriesData.matches || []) {
          const match = matchWrapper.matchInfo;

          if (!match) continue;

          const matchId = match.matchId;
          const team1 = match.team1?.teamName || "Team1";
          const team2 = match.team2?.teamName || "Team2";
          const status = match.status || "Unknown";

          // ✅ Insert teams
          await pool.query(
            "INSERT INTO teams(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
            [team1, team1]
          );

          await pool.query(
            "INSERT INTO teams(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
            [team2, team2]
          );

          // ✅ Insert match
          await pool.query(
            "INSERT INTO matches(id, team1_id, team2_id, match_date, status) VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING",
            [
              matchId,
              team1,
              team2,
              new Date(match.startDate),
              status
            ]
          );
        }
      }
    }

    console.log("✅ Matches, series, teams inserted into database");
  } catch (err) {
    console.error("❌ Error fetching matches:", err.response?.data || err.message);
  }
}

module.exports = fetchMatches;