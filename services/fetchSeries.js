require("dotenv").config();
const api = require("./cricbuzzApi");   // ✅ use unified API
const pool = require("../config/db");

async function fetchSeries() {
  try {
    // 🔥 Cricbuzz endpoint
    const response = await api.get("/series/list");

    const seriesList = response.data?.seriesMapProto || {};

    // Cricbuzz returns object grouped by type (international, league, etc.)
    for (const key in seriesList) {
      const group = seriesList[key];

      if (!group.series || !Array.isArray(group.series)) continue;

      for (const series of group.series) {
        const id = series.id;
        const name = series.name;

        if (!id || !name) continue;

        await pool.query(
          "INSERT INTO leagues(id, name) VALUES($1, $2) ON CONFLICT (id) DO NOTHING",
          [id, name]
        );
      }
    }

    console.log("✅ Series inserted into database");
  } catch (err) {
    console.error("❌ Error fetching series:", err.response?.data || err.message);
  }
}

module.exports = fetchSeries;