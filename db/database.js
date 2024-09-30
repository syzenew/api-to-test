const { Sequelize } = require("sequelize");
const path = require("path");

// Define the SQLite database file location within the project
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "plants.db"), // SQLite database file in the 'db' folder
});

module.exports = sequelize;
