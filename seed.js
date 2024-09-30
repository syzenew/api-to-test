const sequelize = require("./db/database");
const Plant = require("./models/Plant");

const seedDatabase = async () => {
  // Sync the model with the database (creates tables if they don't exist)
  await sequelize.sync({ force: true });

  // Sample data for house plants
  const plants = [
    {
      name: "Snake Plant",
      species: "Sansevieria trifasciata",
      light: "Low",
      water: "Every 2-6 weeks",
      humidity: "Low",
      toxicity: true,
    },
    {
      name: "Spider Plant",
      species: "Chlorophytum comosum",
      light: "Indirect",
      water: "Once a week",
      humidity: "Moderate",
      toxicity: false,
    },
    {
      name: "Peace Lily",
      species: "Spathiphyllum",
      light: "Low to moderate",
      water: "Once a week",
      humidity: "High",
      toxicity: true,
    },
    {
      name: "Pothos",
      species: "Epipremnum aureum",
      light: "Low to bright indirect",
      water: "Every 1-2 weeks",
      humidity: "Low",
      toxicity: true,
    },
    {
      name: "Fiddle Leaf Fig",
      species: "Ficus lyrata",
      light: "Bright indirect",
      water: "Once a week",
      humidity: "Moderate",
      toxicity: true,
    },
    {
      name: "Aloe Vera",
      species: "Aloe barbadensis",
      light: "Bright indirect",
      water: "Every 2-3 weeks",
      humidity: "Low",
      toxicity: false,
    },
    {
      name: "Rubber Plant",
      species: "Ficus elastica",
      light: "Bright indirect",
      water: "Once every 1-2 weeks",
      humidity: "Moderate",
      toxicity: true,
    },
    {
      name: "ZZ Plant",
      species: "Zamioculcas zamiifolia",
      light: "Low to bright indirect",
      water: "Every 2-3 weeks",
      humidity: "Low",
      toxicity: true,
    },
    {
      name: "Boston Fern",
      species: "Nephrolepis exaltata",
      light: "Indirect",
      water: "Keep moist",
      humidity: "High",
      toxicity: false,
    },
    {
      name: "Dracaena",
      species: "Dracaena spp.",
      light: "Low to bright indirect",
      water: "Every 1-2 weeks",
      humidity: "Moderate",
      toxicity: true,
    },
  ];

  // Insert data into the database
  await Plant.bulkCreate(plants);
  console.log("Database seeded with house plants");

  // Close the connection
  await sequelize.close();
};

seedDatabase();
