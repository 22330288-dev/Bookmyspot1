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

const bookingsRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingsRoutes);

const venueRoutes = require("./routes/venues");
app.use("/api/venues", venueRoutes);

const locationRoutes = require("./routes/locations");
app.use("/api/locations", locationRoutes);

const venueOptionsRoutes = require("./routes/venueOptions");
app.use("/api/venue-options", venueOptionsRoutes);

const adminSectionsRoutes = require("./routes/adminSections");
app.use("/api/admin-sections", adminSectionsRoutes);

const adminAreasRoutes = require("./routes/adminAreas");
app.use("/api/admin-areas", adminAreasRoutes);

const cafesRoutes = require("./routes/cafes");
const weddingRoutes = require("./routes/weddingHalls");
const eventRoutes = require("./routes/eventVenues");

app.use("/api/cafes", cafesRoutes);
app.use("/api/wedding-halls", weddingRoutes);
app.use("/api/event-venues", eventRoutes);

const cafeOptionsRoutes = require("./routes/cafeOptions");
app.use("/api/cafe-options", cafeOptionsRoutes);

const cafeBookingsRoutes = require("./routes/cafeBookings");
app.use("/api/cafe-bookings", cafeBookingsRoutes);

const weddingHallsRoutes = require("./routes/weddingHalls");
const weddingOptionsRoutes = require("./routes/weddingOptions");

app.use("/api/wedding-halls", weddingHallsRoutes);
app.use("/api/wedding-options", weddingOptionsRoutes);

const venueMapRoutes = require("./routes/venueMap");
app.use("/api/venue-map", venueMapRoutes);

app.use("/api/cafe-layouts", require("./routes/cafeLayouts"));

app.use("/api/wedding-bookings", require("./routes/weddingBookings"));

const eventOptionsRoutes = require("./routes/eventOptions");
app.use("/api/event-options", eventOptionsRoutes);

const eventBookingsRoutes = require("./routes/eventBookings");
app.use("/api/event-bookings", eventBookingsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("UNHANDLED SERVER ERROR:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



