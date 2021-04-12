require("dotenv").config();
const redis = require("redis");
const express = require("express");
const fetch = require("node-fetch");

const APP_PORT = process.env.APP_PORT || 4444;
const REDIS_PORT = process.env.REDIS_PORT || 3334;
const app = express();
const client = redis.createClient(REDIS_PORT);

function cache(req, res, next) {
  const { username } = req.params;
  client.get(username, (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      res.json({ reps: data });
    } else {
      next();
    }
  });
}

app.get("/repos/:username", cache, async (req, res) => {
  const { username } = req.params;
  try {
    let response = await fetch(`https://api.github.com/users/${username}`);
    let { public_repos } = await response.json();
    client.setex(username, 3600, public_repos);
    return res.json({ reps: public_repos });
  } catch (error) {
    console.log(error);
  }
});

function main(app) {
  app.listen(APP_PORT, () => {
    console.log(`app listening on port ${APP_PORT}`);
  });
}
main(app);
