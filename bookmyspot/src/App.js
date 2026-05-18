import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import EnterCode from "./pages/EnterCode";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Onboarding from "./pages/Onboarding";
import Restaurants from "./pages/Restaurants";
import GuestDashboard from "./pages/GuestDashboard";
import Cafes from "./pages/Cafes";
import WeddingHalls from "./pages/WeddingHalls";
import EventsVenues from "./pages/EventsVenues";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import DiningPreferences from "./pages/DiningPreferences";
import Friends from "./pages/Friends";
import LoyaltyRewards from "./pages/LoyaltyRewards";
import PaymentMethods from "./pages/PaymentMethods";
import MyInsights from "./pages/MyInsights";
import MyReviews from "./pages/MyReviews";
import MyWaitlist from "./pages/MyWaitlist";
import BlockedUsers from "./pages/BlockedUsers";
import HelpSupport from "./pages/HelpSupport";
import PrivacySecurity from "./pages/PrivacySecurity";
import BookVenue from "./pages/BookVenue";
import CreateSeats from "./pages/CreateSeats";
import PayDeposit from "./pages/PayDeposit";
import ConfirmationPage from "./pages/ConfirmationPage";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminBookVenue from "./pages/AdminBookVenue";
import CreateRestaurantMap from "./pages/CreateRestaurantMap";
import AdminLocations from "./pages/AdminLocations";
import AdminSections from "./pages/AdminSections";
import AdminAreas from "./pages/AdminAreas";
import AdminCafes from "./pages/AdminCafes";
import AdminWeddingHalls from "./pages/AdminWeddingHalls";
import AdminEventVenues from "./pages/AdminEventVenues";
import AdminBookCafe from "./pages/AdminBookCafe";
import CreateCafeMap from "./pages/CreateCafeMap";
import BookVenueCafe from "./pages/BookVenueCafe";
import AdminBookWeddingHall from "./pages/AdminBookWeddingHall";
import CreateWeddingHallMap from "./pages/CreateWeddingHallMap";
import BookWeddingHall from "./pages/BookWeddingHall";
import ScanBookingQR from "./pages/ScanBookingQR";
import CreateUserWeddingMap from "./pages/CreateUserWeddingMap";
import MyBookings from "./pages/MyBookings";
import BookingQR from "./pages/BookingQR";
import BookEventVenue from "./pages/BookEventVenue";
import AdminBookEventVenue from "./pages/AdminBookEventVenue";
import CreateEventMap from "./pages/CreateEventMap";
import CreateUserEventMap from "./pages/CreateUserEventMap";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/enter-code" element={<EnterCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
         <Route path="/restaurants" element={<Restaurants />} />
         <Route path="/guest" element={<GuestDashboard />} />
         <Route path="/cafes" element={<Cafes />} />
<Route path="/wedding-halls" element={<WeddingHalls />} />
<Route path="/events-venues" element={<EventsVenues />} />
<Route path="/profile" element={<Profile />} />
<Route path="/edit-profile" element={<EditProfile />} />
<Route path="/dining-preferences" element={<DiningPreferences />} />
<Route path="/friends" element={<Friends />} />
<Route path="/loyalty-rewards" element={<LoyaltyRewards />} />
<Route path="/payment-methods" element={<PaymentMethods />} />
<Route path="/my-insights" element={<MyInsights />} />
<Route path="/my-reviews" element={<MyReviews />} />
<Route path="/my-waitlist" element={<MyWaitlist />} />
<Route path="/blocked-users" element={<BlockedUsers />} />
<Route path="/help-support" element={<HelpSupport />} />
<Route path="/privacy-security" element={<PrivacySecurity />} />
<Route path="/book-venue" element={<BookVenue />} />
<Route path="/create-seats" element={<CreateSeats />} />
<Route path="/pay-deposit" element={<PayDeposit />} />
<Route path="/confirmation" element={<ConfirmationPage />} />
<Route path="/admin-restaurants" element={<AdminRestaurants />} />
<Route path="/admin-book-venue" element={<AdminBookVenue />} />
<Route path="/create-restaurant-map" element={<CreateRestaurantMap />} />
<Route path="/admin/locations" element={<AdminLocations />} />
<Route path="/admin/sections" element={<AdminSections />} />
<Route path="/admin/areas" element={<AdminAreas />} />
<Route path="/admin-cafes" element={<AdminCafes />} />
<Route path="/create-wedding-hall-map" element={<CreateWeddingHallMap />} />
<Route path="/admin-book-wedding-hall" element={<AdminBookWeddingHall />} />
<Route path="/admin-wedding-halls" element={<AdminWeddingHalls />} />
<Route path="/admin-event-venues" element={<AdminEventVenues />} />
<Route path="/admin-book-cafe" element={<AdminBookCafe />} />
<Route path="/create-cafe-map" element={<CreateCafeMap />} />
<Route path="/book-venue-cafe" element={<BookVenueCafe />} />
<Route path="/book-wedding-hall" element={<BookWeddingHall />} />
<Route path="/scan-booking-qr" element={<ScanBookingQR />} />
<Route path="/admin/scan-qr" element={<ScanBookingQR />} />
<Route path="/create-user-wedding-map" element={<CreateUserWeddingMap />} />
<Route path="/my-bookings" element={<MyBookings />} />
<Route path="/book-venue/:venueId" element={<BookVenue />} />
<Route path="/book-venue-cafe/:venueId" element={<BookVenueCafe />} />
<Route path="/book-wedding-hall/:venueId" element={<BookWeddingHall />} />
<Route path="/booking-qr/:bookingNumber" element={<BookingQR />} />
<Route path="/book-event-venue" element={<BookEventVenue />} />
<Route path="/admin-book-event-venue" element={<AdminBookEventVenue />} />
<Route path="/create-event-map" element={<CreateEventMap />} />
<Route path="/create-user-event-map" element={<CreateUserEventMap />} />


      </Routes>
    </Router>
  );
}

export default App;