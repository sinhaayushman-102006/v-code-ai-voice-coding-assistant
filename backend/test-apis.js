import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';

dotenv.config();

async function testApis() {
  console.log("Testing OpenRouter API...");
  const orClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const res = await orClient.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: "Say the word 'Test'" }],
      max_tokens: 10,
    });
    console.log("OpenRouter API ✅:", res.choices[0].message.content);
  } catch (e) {
    console.error("OpenRouter API ❌:", e.message);
  }

  console.log("\nTesting Groq Whisper API...");
  const groqClient = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    // Create a dummy file to send
    fs.writeFileSync("dummy.txt", "dummy");
    
    // We expect a 400 Bad Request (invalid file format) instead of 401 Unauthorized
    await groqClient.audio.transcriptions.create({
      file: fs.createReadStream("dummy.txt"),
      model: "whisper-large-v3",
    });
    
    console.log("Groq API ✅ (Unexpectedly accepted dummy file)");
  } catch (e) {
    if (e.status === 400) {
      console.log("Groq API ✅ (Authenticated, rejected dummy file as expected)");
    } else {
      console.error("Groq API ❌:", e.message);
    }
  } finally {
    fs.unlinkSync("dummy.txt");
  }
}

testApis();
