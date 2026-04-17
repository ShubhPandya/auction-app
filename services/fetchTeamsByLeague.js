require("dotenv").config();
const api = require("./cricbuzzApi");   // ✅ use Cricbuzz API
const pool = require("../config/db");

async function fetchTeamsByLeague(seriesId) {
  try {
    // 🔥 Cricbuzz endpoint
    const response = await api.get(`/series/get-squads?seriesId=${seriesId}`);

    const squads = response.data?.squads || [];

    for (const team of squads) {
      const teamId = team.teamId;
      const teamName = team.teamName;

      if (!teamId || !teamName) continue;

      await pool.query(
        "INSERT INTO teams(id, name, league_id) VALUES($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        [teamId, teamName, seriesId]
      );
    }

    console.log(`✅ Teams inserted for league: ${seriesId}`);
  } catch (err) {
    console.error("❌ Error fetching teams:", err.response?.data || err.message);
  }
}

module.exports = fetchTeamsByLeague;