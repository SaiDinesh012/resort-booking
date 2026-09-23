const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/seed", require("./routes/seedRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/packages", require("./routes/packageRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/media", require("./routes/mediaRoutes"));
app.use("/api/content", require("./routes/contentRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "online", message: "Resort Booking Express API Server Running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Express API server running on port ${PORT}`);
}); // restarted
