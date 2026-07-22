require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { body, param, validationResult } = require('express-validator');
const sequelize = require("./db/database"); // Sequelize instance
const Plant = require("./models/Plant"); // Plant model from Sequelize
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Validation middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
};

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
app.post('/login', 
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token if credentials are correct
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});;

// GET method to retrieve all plants
app.get("/plants", authenticateToken, async (req, res) => {
  try {
    const plants = await Plant.findAll();
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET method to retrieve a specific plant by ID
app.get("/plants/:id", 
  param('id').isInt().withMessage('Plant ID must be a valid integer'),
  handleValidationErrors,
  authenticateToken, 
  async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST method to add a new plant
app.post("/plants", 
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Plant name is required'),
  body('species').trim().notEmpty().withMessage('Plant species is required'),
  body('light').trim().notEmpty().withMessage('Light requirement is required'),
  body('water').trim().notEmpty().withMessage('Water requirement is required'),
  body('humidity').trim().notEmpty().withMessage('Humidity requirement is required'),
  body('toxicity').optional().isBoolean().withMessage('Toxicity must be a boolean'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const newPlant = await Plant.create(req.body);
    res.status(201).json(newPlant);
  } catch (error) {
    res.status(400).json({ message: "Error creating plant", error: error.message });
  }
});

// DELETE method to remove a plant
app.delete("/plants/:id", 
  param('id').isInt().withMessage('Plant ID must be a valid integer'),
  handleValidationErrors,
  authenticateToken, 
  async (req, res) => {
  try {
    const id = req.params.id;
    const deletedPlant = await Plant.destroy({ where: { id } });
    if (!deletedPlant) return res.status(404).json({ message: 'Plant not found' });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PATCH method to update a plant
app.patch("/plants/:id", 
  param('id').isInt().withMessage('Plant ID must be a valid integer'),
  body('name').optional().trim().notEmpty().withMessage('Plant name cannot be empty'),
  body('species').optional().trim().notEmpty().withMessage('Plant species cannot be empty'),
  body('light').optional().trim().notEmpty().withMessage('Light requirement cannot be empty'),
  body('water').optional().trim().notEmpty().withMessage('Water requirement cannot be empty'),
  body('humidity').optional().trim().notEmpty().withMessage('Humidity requirement cannot be empty'),
  body('toxicity').optional().isBoolean().withMessage('Toxicity must be a boolean'),
  handleValidationErrors,
  authenticateToken,
  async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPlant = await Plant.update(req.body, {
      where: { id },
      returning: true,
    });
    if (!updatedPlant[0]) return res.status(404).json({ message: 'Plant not found' });
    res.json(updatedPlant[1][0]);
  } catch (error) {
    res.status(400).json({ message: "Error updating plant", error: error.message });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
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
