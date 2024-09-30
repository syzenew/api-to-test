const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const Plant = require("./models/Plant"); // Plant model from Sequelize
const sequelize = require("./db/database"); // Sequelize instance

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a secure key

app.use(bodyParser.json());

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login route to generate token
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple username/password check for demo purposes
  if (username === "test" && password === "password") {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// GET method to retrieve all plants
app.get("/plants", authenticateToken, async (req, res) => {
  try {
    const plants = await Plant.findAll();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// POST method to add a new plant
app.post("/plants", authenticateToken, async (req, res) => {
  try {
    const newPlant = await Plant.create(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: "Error creating plant", error });
  }
});

// DELETE method to remove a plant
app.delete("/plants/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const deletedPlant = await Plant.destroy({ where: { id } });
    if (!deletedPlant) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// PATCH method to update a plant
app.patch("/plants/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlant = await Plant.update(req.body, {
      where: { id },
      returning: true,
    });
    if (!updatedPlant[0]) return res.sendStatus(404);
    res.json(updatedPlant[1][0]);
  } catch (error) {
    res.status(400).json({ message: "Error updating plant", error });
  }
});

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
