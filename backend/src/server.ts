// Bypass TLS verification for local corporate proxy environments
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = Number(process.env.PORT ?? 5000);

app.listen(PORT, () => {
  console.log(`V-Code backend listening on http://localhost:${PORT}`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn(
      "OPENROUTER_API_KEY is not set. AI endpoints will respond with a clear 'not configured' message instead of failing silently. See .env.example."
    );
  }
});
