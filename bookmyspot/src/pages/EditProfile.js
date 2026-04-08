import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Shield, Save, CircleAlert } from "lucide-react";
import "./EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();

  const savedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  }, []);

  const fullName = savedUser.name || "Maria Maalouf";
  const splitName = fullName.trim().split(" ");
  const first = splitName[0] || "Maria";
  const last = splitName.slice(1).join(" ") || "Maalouf";

  const [firstName, setFirstName] = useState(first);
  const [lastName, setLastName] = useState(last);
  const [email] = useState(savedUser.email || "22230044@students.liu.edu.lb");
  const [phone] = useState(savedUser.phone || "70368548");
  const [dob, setDob] = useState("04-01-2005");
  const [photo, setPhoto] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...savedUser,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      dob,
      photo,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully");
    navigate("/profile");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <div className="edit-profile-topbar">
          <button
            type="button"
            className="edit-profile-back-btn"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={28} />
          </button>

          <div className="edit-profile-title-wrap">
            <h1 className="edit-profile-title">Edit Profile</h1>
            <div className="edit-profile-line" />
          </div>
        </div>

        <div className="edit-profile-photo-section">
          <div className="edit-profile-avatar-wrap">
            <div className="edit-profile-avatar">
              {photo ? (
                <img src={photo} alt="Profile" />
              ) : (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Default Profile"
                />
              )}
            </div>

            <label className="camera-btn">
              <Camera size={22} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          <p className="change-photo-text">Change Photo</p>
        </div>

        <div className="edit-profile-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} disabled className="locked-input" />
            <p className="help-text">
              Your email address is locked and cannot be modified for security
              purposes
            </p>
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <div className="phone-input-box">
              <div className="flag-box">🇱🇧</div>
              <div className="phone-code">+961</div>
              <input type="text" value={phone} disabled className="phone-input" />
            </div>

            <p className="help-text">
              Phone number cannot be changed once set for security purposes
            </p>

            <button type="button" className="verify-btn">
              <Shield size={20} />
              <span>Verify phone number</span>
            </button>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="text"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="DD-MM-YYYY"
            />
            <p className="help-text">Must be at least 13 years old</p>
          </div>

          <div className="account-info-box">
            <div className="account-info-title">
              <CircleAlert size={20} />
              <span>Account Information</span>
            </div>
            <p>Member since 22/02/2026</p>
          </div>
        </div>

        <div className="save-btn-wrap">
          <button type="button" className="save-btn" onClick={handleSave}>
            <Save size={22} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}