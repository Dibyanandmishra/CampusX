const mongoose = require("mongoose");
const SOSReport = require("./models/SOSReport");
require("dotenv").config();

// Sample SOS reports for testing
const sampleReports = [
  {
    userId: "user001",
    userName: "Alice Johnson",
    location: { lat: 40.7128, lng: -74.006 },
    type: "emergency",
    status: "active",
    description: "Feeling unsafe in parking lot",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    userId: "user002",
    userName: "Bob Smith",
    location: { lat: 40.7142, lng: -74.0064 },
    type: "medical",
    status: "resolved",
    description: "Medical emergency - resolved by campus health",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    userId: "user003",
    userName: "Carol Davis",
    location: { lat: 40.7135, lng: -74.0055 },
    type: "security",
    status: "active",
    description: "Suspicious person following me",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/campus-safety"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await SOSReport.deleteMany({});
    console.log("Cleared existing SOS reports");

    // Insert sample data
    const insertedReports = await SOSReport.insertMany(sampleReports);
    console.log(`Inserted ${insertedReports.length} sample SOS reports`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
