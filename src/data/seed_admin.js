require("dotenv").config();
const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  { key: { type: String, required: true, unique: true }, value: mongoose.Schema.Types.Mixed },
  { timestamps: true }
);
const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
    avatar: { type: String },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastBookingDate: { type: String },
    status: { type: String, default: "active" },
    role: { type: String, default: "admin" },
    tags: { type: [String], default: ["admin"] },
  },
  { timestamps: true }
);
const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

const ADMIN_CREDS = {
  username: "admingrandin12@gmail.com",
  email: "admingrandin12@gmail.com",
  password: "Grandin@123#",
  role: "admin",
};

async function seedAdmin() {
  console.log("[SEED] Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("[DB] Connected to:", mongoose.connection.host, "/", mongoose.connection.name);

  // 1. Seed into settings collection under 'admin_auth'
  const settingResult = await Setting.findOneAndUpdate(
    { key: "admin_auth" },
    {
      key: "admin_auth",
      value: ADMIN_CREDS,
    },
    { upsert: true, new: true }
  );
  console.log("✅ Seeded admin credentials into 'settings' collection (key: admin_auth):", settingResult.key);

  // 2. Also ensure an admin customer record exists for unified customer/admin auth
  const customerResult = await Customer.findOneAndUpdate(
    { email: ADMIN_CREDS.email },
    {
      id: "admin_grandin",
      firstName: "Admin",
      lastName: "Grandin",
      email: ADMIN_CREDS.email,
      password: ADMIN_CREDS.password,
      phone: "+91 98765 43210",
      status: "active",
      role: "admin",
      tags: ["admin", "staff"],
    },
    { upsert: true, new: true }
  );
  console.log("✅ Seeded admin account into 'customers' collection:", customerResult.email);

  // 3. Verify read
  const verifySetting = await Setting.findOne({ key: "admin_auth" });
  console.log("\n--- Verification ---");
  console.log("Setting key :", verifySetting.key);
  console.log("DB Username :", verifySetting.value.username);
  console.log("DB Password :", verifySetting.value.password ? "********" : "EMPTY");
  console.log("DB Role     :", verifySetting.value.role);

  await mongoose.disconnect();
  console.log("\n[DONE] Admin credentials successfully saved in MongoDB.");
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
