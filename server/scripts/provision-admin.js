/**
 * Cashlytics Admin Provisioning Script
 *
 * Usage:
 *   node scripts/provision-admin.js [email]
 *
 * Example:
 *   node scripts/provision-admin.js admin@example.com
 *
 * If no email argument is provided, it uses the ADMIN_EMAIL environment variable.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const env = require("../src/config/env");
const User = require("../src/models/User");

async function main() {
  const targetEmail = (process.argv[2] || env.adminEmail || "").toLowerCase().trim();

  if (!targetEmail) {
    console.error("Error: No email provided. Provide an email argument or set ADMIN_EMAIL in .env.");
    console.error("Usage: node scripts/provision-admin.js <email>");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at: ${env.mongoUri}...`);
  await mongoose.connect(env.mongoUri);

  try {
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`User '${targetEmail}' does not exist yet.`);
      console.log(`Creating provisioning record with role: 'admin'...`);
      user = await User.create({
        name: targetEmail.split("@")[0],
        email: targetEmail,
        role: "admin",
        authProviders: ["email"],
        onboardingCompleted: true,
      });
      console.log(`Successfully created admin user: ${user.email} (ID: ${user._id})`);
    } else {
      if (user.role === "admin") {
        console.log(`User '${targetEmail}' is already an administrator.`);
      } else {
        user.role = "admin";
        await user.save();
        console.log(`Successfully promoted '${targetEmail}' to administrator.`);
      }
    }
  } catch (err) {
    console.error("Failed to provision admin:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();
