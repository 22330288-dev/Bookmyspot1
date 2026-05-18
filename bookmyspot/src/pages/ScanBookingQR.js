import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./ScanBookingQR.css";

export default function ScanBookingQR() {
  const navigate = useNavigate();

  const [manualValue, setManualValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastScannedText, setLastScannedText] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const extractQrData = (rawText) => {
    try {
      const parsed = JSON.parse(rawText);

      return {
        bookingNumber:
          parsed.booking_number ||
          parsed.bookingNumber ||
          parsed.booking_no ||
          "",
        qrToken: parsed.token || parsed.qr_token || "",
      };
    } catch {
      return {
        bookingNumber: String(rawText || "").trim(),
        qrToken: "",
      };
    }
  };

  const handleScanText = async (rawText) => {
    if (!rawText || loading) return;
    if (rawText === lastScannedText) return;

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setCheckInData(null);
      setIsCheckedIn(false);
      setLastScannedText(rawText);

      const { bookingNumber, qrToken } = extractQrData(rawText);

      if (!bookingNumber) {
        setErrorMessage("Invalid QR data");
        return;
      }

      /*
        If QR has token: do real check-in.
        If QR has only booking number: verify only and show booking details.
      */
      const response = qrToken
        ? await fetch("http://localhost:5000/api/bookings/check-in", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              booking_number: bookingNumber,
              qr_token: qrToken,
            }),
          })
        : await fetch(
            `http://localhost:5000/api/bookings/verify-all/${bookingNumber}`
          );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Booking not found");
        return;
      }

      setCheckInData(data.booking || null);

      if (qrToken) {
        setIsCheckedIn(true);
        setSuccessMessage(data.message || "Customer checked in successfully");
      } else {
        setIsCheckedIn(false);
        setSuccessMessage(
          "Booking verified successfully. This QR has no token, so check-in was not applied."
        );
      }
    } catch (error) {
      console.error("SCAN / CHECK-IN ERROR:", error);
      setErrorMessage("Invalid QR or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    await handleScanText(manualValue);
  };

  const resetScanner = () => {
    setManualValue("");
    setLoading(false);
    setCheckInData(null);
    setErrorMessage("");
    setSuccessMessage("");
    setLastScannedText("");
    setIsCheckedIn(false);
  };

  const renderArrayValue = (value) => {
    if (!value) return "-";

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "-";
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.length > 0 ? parsed.join(", ") : "-";
      }
    } catch {
      return String(value);
    }

    return String(value);
  };

  return (
    <div className="scan-page">
      <div className="scan-container">
        <button
          type="button"
          className="scan-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
          <span>Back</span>
        </button>

        <h1 className="scan-title">Scan Booking QR</h1>

        <p className="scan-subtitle">
          Scan the customer QR code to confirm arrival and view reservation
          details.
        </p>

        {!checkInData && (
          <div className="scan-card">
            <div className="scan-camera-wrap">
              <Scanner
                onScan={(result) => {
                  if (Array.isArray(result) && result.length > 0) {
                    const rawValue = result[0]?.rawValue;

                    if (rawValue) {
                      handleScanText(rawValue);
                    }
                  }
                }}
                onError={(error) => {
                  console.error("Scanner error:", error);
                }}
                constraints={{
                  facingMode: "environment",
                }}
                styles={{
                  container: {
                    width: "100%",
                  },
                }}
              />
            </div>
          </div>
        )}

        {!checkInData && (
          <div className="scan-card">
            <h2 className="scan-section-title">Or Paste QR Text Manually</h2>

            <textarea
              className="scan-textarea"
              placeholder='Paste QR JSON here, example: {"booking_number":"BK-10044","token":"..."}'
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
            />

            <button
              type="button"
              className="scan-action-btn"
              onClick={handleManualCheckIn}
              disabled={loading}
            >
              {loading ? "Checking..." : "Check / Verify"}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="scan-card error-card">
            <div className="scan-status-row">
              <AlertCircle size={22} />
              <strong>Error</strong>
            </div>

            <p>{errorMessage}</p>

            <button
              type="button"
              className="scan-action-btn"
              onClick={resetScanner}
            >
              Try Again
            </button>
          </div>
        )}

        {successMessage && checkInData && (
          <div className="scan-card success-card">
            <div className="scan-status-row">
              <CheckCircle2 size={22} />
              <strong>
                {isCheckedIn
                  ? "Customer Checked In Successfully"
                  : "Booking Verified Successfully"}
              </strong>
            </div>

            <p>{successMessage}</p>

            <div className="scan-result-grid">
              <div className="scan-result-row">
                <span>Booking Number</span>
                <strong>{checkInData.booking_number || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Type</span>
                <strong>{checkInData.type || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Venue</span>
                <strong>{checkInData.venue_name || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Table</span>
                <strong>{checkInData.table_id || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Chairs / Items</span>
                <strong>{renderArrayValue(checkInData.selected_chairs)}</strong>
              </div>

              <div className="scan-result-row">
                <span>Sofas</span>
                <strong>{renderArrayValue(checkInData.selected_sofas)}</strong>
              </div>

              <div className="scan-result-row">
                <span>Seats</span>
                <strong>{checkInData.booked_seats || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Date</span>
                <strong>
                  {String(checkInData.booking_date || "").split("T")[0] || "-"}
                </strong>
              </div>

              <div className="scan-result-row">
                <span>Time</span>
                <strong>{checkInData.booking_time || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Duration</span>
                <strong>{checkInData.duration || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Section</span>
                <strong>{checkInData.section || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Area</span>
                <strong>{checkInData.area || "-"}</strong>
              </div>

              <div className="scan-result-row">
                <span>Status</span>
                <strong>
                  {checkInData.check_in_status ||
                    (isCheckedIn ? "checked_in" : "verified")}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="scan-action-btn"
              onClick={resetScanner}
            >
              Scan Another QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}