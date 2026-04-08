CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT,
  league_id TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT,
  team_id TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  team1_id TEXT,
  team2_id TEXT,
  match_date TIMESTAMP,
  status TEXT
);

CREATE TABLE IF NOT EXISTS player_match_stats (
  id SERIAL PRIMARY KEY,
  match_id TEXT,
  player_id TEXT,
  runs INT,
  wickets INT,
  goals INT,
  assists INT
);