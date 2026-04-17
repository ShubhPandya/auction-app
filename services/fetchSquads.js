const api = require("./cricbuzzApi");
const db = require("../config/db");

async function fetchSquads(seriesId) {
  try {
    const response = await api.get(`/series/get-squads?seriesId=${seriesId}`);

    const squads = response.data?.squads || [];

    for (const team of squads) {
      const teamName = team.teamName;

      for (const player of team.players) {
        const name = player.name;
        const role = player.role || "Unknown";

        await db.query(
          "INSERT INTO players (name, role, team) VALUES ($1, $2, $3)",
          [name, role, teamName]
        );
      }
    }

    console.log("✅ Players inserted from squads");
  } catch (err) {
    console.error("❌ Error fetching squads:", err.response?.data || err.message);
  }
}

module.exports = fetchSquads;