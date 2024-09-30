const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Plant = sequelize.define("Plant", {
  name: { type: DataTypes.STRING, allowNull: false },
  species: { type: DataTypes.STRING, allowNull: false },
  light: { type: DataTypes.STRING, allowNull: false },
  water: { type: DataTypes.STRING, allowNull: false },
  humidity: { type: DataTypes.STRING, allowNull: false },
  toxicity: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Plant;
