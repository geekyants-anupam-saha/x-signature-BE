const express = require("express");
const app = express();
const cors = require("cors"); // Import cors
const crypto = require("crypto");

const PORT = 3000;

// Constants (replace with your actual CLIENT_ID and CLIENT_SECRET)
const CLIENT_ID = "a409c0cc63cf1951bedd189dae715b83";
const CLIENT_SECRET =
  "dd42b002e3553be3fba8ecf4ebe30849f4536dcd276773361d947e73269dc497";

// Middleware to parse JSON requests
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-signature"],
  })
);

// Middleware to verify x-signature
app.use((req, res, next) => {
  const receivedSignature = req.headers["x-signature"];
  if (!receivedSignature) {
    return res.status(401).json({ message: "Missing x-signature header" });
  }

  const method = req.method;
  const url = req.originalUrl; // This will give the full URL path
  const clientid = CLIENT_ID;

  const signHeader = { clientid };
  const data =
    req.body && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : "";

  // Construct the string to sign
  const stringToSign = `${method}\n${url}\n${JSON.stringify(
    signHeader
  )}\n${data}`;

  // Generate the signature
  const hmac = crypto.createHmac("sha256", CLIENT_SECRET);
  hmac.update(stringToSign);
  const generatedSignature = hmac.digest("hex");

  if (receivedSignature !== generatedSignature) {
    return res.status(403).json({ message: "Invalid x-signature" });
  }

  // If signature matches, continue to the route handler
  next();
});

// Simple GET route
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// POST route for handling form submission
app.post("/api/submit", (req, res) => {
  const { firstName, lastName } = req.body;
  res.json({ message: `Received data for ${firstName} ${lastName}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
