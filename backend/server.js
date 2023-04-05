import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

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

app.use(cors());

app.use(bodyParser.json());
app.post("/users", (req, res) => {
  const user = req.body;
  console.log(
    "req body ",
    +user.username + " " + user.password + " " + user.amount
  );

  user.id = userId++;
  users.push(user);

  const account = { money: user.amount, userId: user.id };
  accounts.push(account);
  console.log(users);

  res.statusCode = 200;
  res.send("ok");
});

app.post("/sessions", (req, res) => {
  const user = req.body;
  const dbUser = users.find((u) => u.username == user.username);
  if (dbUser != null && dbUser.password == user.password) {
    const token = generateAccessToken(dbUser.id);
    console.log("token", token);
    res.json({ token });
  } else {
    res.status = 404;
    res.json();
  }
});

app.get("/me/accounts", authenticateToken, (req, res) => {
  console.log("userId", req.userId);
  //Använd userId för att hämta account.

  const account = accounts.find((a) => a.userId == req.userId);

  res.json(account);
  console.log("accounts: ", accounts);
});

app.listen(PORT, () => {
  console.log("Server started on port" + PORT);
});
