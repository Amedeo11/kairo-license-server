const express = require("express");
const app = express();

app.use(express.json());

// DATABASE FAKE (per ora)
const licenses = {
  "KAIRO-TEST-1234": {
    revoked: false,
    expires: "2026-08-31"
  }
};

app.post("/verify-license", (req, res) => {

  const { license, hwid } = req.body;

  if (!license || !hwid) {
    return res.status(400).json({ valid: false, reason: "Bad request" });
  }

  const lic = licenses[license];

  if (!lic) {
    return res.json({ valid: false, reason: "License not found" });
  }

  if (lic.revoked) {
    return res.json({ valid: false, reason: "License revoked" });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today > lic.expires) {
    return res.json({ valid: false, reason: "License expired" });
  }

  // OK
  return res.json({
    valid: true,
    expires: lic.expires
  });
});

app.get("/test", (req, res) => {
  res.send("Server OK");
});


app.listen(3000, () => {
  console.log("License server running on http://localhost:3000");
});
