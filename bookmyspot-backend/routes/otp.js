const express = require("express");
const router = express.Router();
const twilio = require("twilio");

const client = twilio("ACCOUNT_SID", "AUTH_TOKEN");

// generate code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

router.post("/send-whatsapp-code", async (req, res) => {
  const { phone } = req.body;

  const code = generateCode();

  try {
    await client.messages.create({
      body: `Your verification code is: ${code}`,
      from: "whatsapp:+14155238886", // Twilio sandbox number
      to: `whatsapp:${phone}`, // example: whatsapp:+961XXXXXXXX
    });

    res.json({ success: true, code }); // لاحقًا خزّني الكود بالـ DB
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send WhatsApp message" });
  }
});

module.exports = router;