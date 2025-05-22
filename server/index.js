const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
require("dotenv").config();

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    console.log("Mongo URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");

    app.listen(5050, () => console.log("Server running on port 5050"));
  } catch (err) {
    console.error("Mongo connection error:", err);
  }
}

startServer();


const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
  auditResults: Object,
}));

app.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  await User.create({ email: req.body.email, password: hash });
  res.sendStatus(201);
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.sendStatus(401);
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.sendStatus(403);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

const axios = require("axios");

app.get("/audit/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
      headers: {
        "hibp-api-key": process.env.HIBP_API_KEY,
        "user-agent": "SecAuditApp",
      },
    });

    res.status(200).json({
      breaches: response.data, // contains array of breaches
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(200).json({ breaches: [] }); // No breach
    }
    res.status(500).send("Error fetching breaches");
  }
});


app.post("/audit/submit", async (req, res) => {
  const { email, results } = req.body;
  await User.findOneAndUpdate({ email }, { auditResults: results });
  res.sendStatus(200);
});

app.listen(5050, () => console.log("Server running on port 5050"));
