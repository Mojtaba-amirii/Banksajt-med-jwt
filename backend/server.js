// Utgå från förra workshopen, men spara data för users och accounts i mySql.

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import mysql from "mysql";

const secret = "summer";

function generateAccessToken(userId) {
  return jwt.sign(userId, secret);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, secret, (err, userId) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.userId = userId;
    next();
  });
}

const app = express();
const PORT = 4001;
const users = [];
const accounts = [];
let userId = 1;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "muji bank",
});

app.use(cors());

app.use(bodyParser.json());

app.post("/users", (req, res) => {
  const user = req.body;

  const { username, password, amount } = user;
  console.log("req body ", user);

  connection.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    (err, results) => {
      console.log("results", results);
      console.log(err);

      if (err) {
        res.sendStatus(500);
      } else {
        const userId = results.insertId;

        connection.query(
          "INSERT INTO accounts (user_id, amount) VALUES (?, ?)",
          [userId, amount],
          (err, results) => {
            console.log("err from insert account in db", err);
            if (err) {
              res.sendStatus(500);
            } else {
              res.sendStatus(200);
            }
          }
        );
      }
    }
  );
});

app.post("/sessions", (req, res) => {
  const user = req.body;

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [user.username],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        const dbUser = results[0];
        if (dbUser != null && dbUser.password == user.password) {
          const token = generateAccessToken(dbUser.id);
          console.log("token", token);
          res.json({ token });
        } else {
          res.status = 404;
          res.json();
        }
      }
    }
  );
});

app.get("/me/accounts", authenticateToken, (req, res) => {
  console.log("userId", req.userId);
  //Använd userId för att hämta account.

  connection.query(
    "SELECT * FROM accounts WHERE user_id = ?",
    [req.userId],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        const dbAccount = results[0];
        res.json(dbAccount);
      }

      console.log("results", results);
    }
  );
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("DB: connected!");
    app.listen(PORT, () => {
      console.log("Server started on port: " + PORT);
    });
  }
});
