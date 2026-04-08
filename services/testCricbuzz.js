const api = require("./cricbuzzApi");

async function testApi() {
  try {
    const response = await api.get("/matches/v1/recent");
    console.log("CRICBUZZ DATA:");
    console.log(response.data);
  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
  }
}

module.exports = testApi;