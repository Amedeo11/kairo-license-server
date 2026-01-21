import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

// 🔐 SEGRETO (NON hardcoded)
const SECRET = process.env.LICENSE_SECRET;
if (!SECRET) {
  throw new Error("LICENSE_SECRET not set");
}

// DATABASE FAKE (per ora)
const licenses = {
  "KAIRO-TEST-1234": {
    revoked: false,
    expires: "2026-08-31",
    hwid: null
  }
};

// firma HMAC
function sign(payload) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}

app.post("/verify-license", (req, res) => {

  const { license, hwid } = req.body;

  if (!license || !hwid) {
    return res.status(400).json({ valid: false });
  }

  const lic = licenses[license];
  if (!lic) {
    return res.json({ valid: false });
  }

  if (lic.revoked) {
    return res.json({ valid: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today > lic.expires) {
    return res.json({ valid: false });
  }

  // 🔒 bind HWID
  if (lic.hwid && lic.hwid !== hwid) {
    return res.json({ valid: false });
  }

  if (!lic.hwid) {
    lic.hwid = hwid;
  }

  const payload = {
    valid: true,
    expires: lic.expires
  };

  return res.json({
    ...payload,
    signature: sign(payload)
  });
});

// health check
app.get("/health", (_, res) => {
  res.send("OK");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`License server running on port ${port}`);
});
