const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const restaurantsRoutes = require("./routes/restaurants");
app.use("/api/restaurants", restaurantsRoutes);

const otpRoutes = require("./routes/otp");
app.use("/api/otp", otpRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});