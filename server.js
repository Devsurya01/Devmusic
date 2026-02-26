const mongoose = require("mongoose");

// Connect to MongoDB (replace with your connection string if using Atlas)
mongoose.connect("mongodb+srv://Devmusics:< OIrAEdS4MhD8uIrK>@devmusicscluster.he9mtvt.mongodb.net/?appName=DevmusicsCluster")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: false }, // Optional for login
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const songs = require("./songs.json");
// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already registered." });

    user = new User({ name, email, password });
    await user.save();
    res.json({ message: "Account created successfully! 🎉" });
  } catch (err) {
    res.status(500).json({ message: "Error creating account" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    res.json({ message: "Login successful!", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});
// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already registered." });

    user = new User({ name, email, password });
    await user.save();

    res.json({ message: "Account created successfully! 🎉" });
  } catch (err) {
    res.status(500).json({ message: "Error creating account" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    res.json({ message: "Login successful!", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});
// Get all songs
app.get("/songs", (req, res) => {
  res.json(songs);
});

// Like a song
app.post("/like", (req, res) => {
  const likedSong = req.body;

  let liked = [];
  if (fs.existsSync("liked.json")) {
    liked = JSON.parse(fs.readFileSync("liked.json"));
  }

  liked.push(likedSong);
  fs.writeFileSync("liked.json", JSON.stringify(liked, null, 2));

  res.json({ message: "Song liked ❤️" });
});

// Get liked songs
app.get("/liked", (req, res) => {
  if (!fs.existsSync("liked.json")) return res.json([]);
  const liked = JSON.parse(fs.readFileSync("liked.json"));
  res.json(liked);
});
// --- Add this to server.js ---
app.post("/unlike", (req, res) => {
  const songToRemove = req.body;
  const filePath = "liked.json";

  if (fs.existsSync(filePath)) {
    let liked = JSON.parse(fs.readFileSync(filePath));
    
    // Filter out the song with the matching ID to permanently delete it
    const updatedLibrary = liked.filter(song => song.id !== songToRemove.id);
    
    fs.writeFileSync(filePath, JSON.stringify(updatedLibrary, null, 2));
    res.json({ message: "Song removed from library permanently 🗑️" });
  } else {
    res.status(404).json({ message: "Library file not found" });
  }
});
app.listen(5000, () => {
  console.log("🎵 Devmusics backend running on port 5000");
});
// This code belongs in server.js
app.post("/unlike", (req, res) => {
  const songToRemove = req.body;
  if (fs.existsSync("liked.json")) {
    let liked = JSON.parse(fs.readFileSync("liked.json"));
    
    // Filter out the song so it is permanently deleted from the file
    const updatedLibrary = liked.filter(song => song.id !== songToRemove.id);
    
    fs.writeFileSync("liked.json", JSON.stringify(updatedLibrary, null, 2));
    res.json({ message: "Permanently removed from library" });
  } else {
    res.status(404).json({ message: "Library file not found" });
  }
});