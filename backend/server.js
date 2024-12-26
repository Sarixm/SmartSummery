import express from "express";
import multer from "multer";
import { createReadStream } from "fs";
import crypto from "crypto";
import {
  getWhissperClient,
  getJsonFieldsFilled,
  formatModelResponse,
  logWithTimestamp,
  FinalVersionFormFilled,
} from "./config/openAI.js";

const port = process.env.PORT || 5000;

const app = express();

//Configuration of the local storgae
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const random = crypto.randomBytes(4).toString("hex");
    const originalName = file.originalname;
    cb(null, `${timestamp}_${random}_${originalName}`);
  },
});
const upload = multer({ storage: storage });

logWithTimestamp(`Server starting in dev mode`);

app.get("/", (req, res) => {
  res.send("API Endpoint is served");
});

app.post("/final", upload.single("audio"), async (req, res) => {
  try {
    logWithTimestamp("=============== Analyze Endpoint ===============");
    if (!req.file) {
      return res.status(400).send("No audio file uploaded");
    }
    logWithTimestamp("Step One: Getting audio file ...");
    // Only on production
    const audioFilePath = req.file.path;
    logWithTimestamp("Step Two: Connecting to Whissper Model ...");
    const client = getWhissperClient();

    logWithTimestamp("Step Three: Processsing audio transcript ...");
    const resultText = await client.audio.transcriptions.create({
      model: "whisper",
      language: "he",
      prompt: `
      You are provided with an hebrew audio conversation, transcript it into hebrew transcript.
      If the values are numbers such as אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע עשר אפס transcript it to an regular number representation like 1 2 3 4 5 6 7 8 9 0 etc
      If the numbers are in a row, make sure to write it a single number rather single digits all by themselves

      here is an example
      "אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע"
      Im expecting you to provide the transcript as:
      "123456789"

      If the numbers are not in a row, for example there is a stop between the digits and the conversation switched, present it as a digits and not as single number
      `,
      file: createReadStream(audioFilePath),
    });
    console.log(resultText);

    logWithTimestamp("Step Four: Transcript succefully been generated ...");
    const result = await FinalVersionFormFilled(resultText.text);
    console.log(result);

    logWithTimestamp(
      "Step Eight: Formatting info data into proper JSON file ..."
    );
    const formattedResult = formatModelResponse(result);

    logWithTimestamp(
      "Step Nine: Form data been converted into JSON succefully ..."
    );
    logWithTimestamp("Step Ten: Server responded");
    res.setHeader("Content-Type", "application/json");
    res.send(formattedResult);
  } catch (err) {
    console.log(err);
    logWithTimestamp("Error analyzing transcript:", err.message);
    res.status(500).send("Server Error");
  }
});

// API Endpoint: POST Upload audio and initiate transcription
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    logWithTimestamp("=============== Transcribe Endpoint ===============");
    logWithTimestamp("Step One: Getting audio file ...");
    if (!req.file) {
      return res.status(400).send("No audio file uploaded");
    }
    const audioFilePath = req.file.path;

    logWithTimestamp("Step Two: Connecting to Whissper Model ...");
    const client = getWhissperClient();

    logWithTimestamp("Step Three: Processsing audio transcript ...");
    const result = await client.audio.transcriptions.create({
      model: "whisper",
      language: "he",
      prompt: `
      You are provided with an hebrew audio conversation, transcript it into hebrew transcript.
      If the values are numbers such as אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע עשר אפס transcript it to an regular number representation like 1 2 3 4 5 6 7 8 9 0 etc
      If the numbers are in a row, make sure to write it a single number rather single digits all by themselves

      here is an example
      "אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע"
      Im expecting you to provide the transcript as:
      "123456789"

      If the numbers are not in a row, for example there is a stop between the digits and the conversation switched, present it as a digits and not as single number
      `,
      file: createReadStream(audioFilePath),
    });
    console.log(result);
    logWithTimestamp("Step Four: Transcript succefully been generated ...");
    logWithTimestamp("Step Five: Server responded");
    res.json({ text: result.text });
  } catch (err) {
    logWithTimestamp("Error initiating transcription:", err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/analyze", upload.single("audio"), async (req, res) => {
  try {
    logWithTimestamp("=============== Analyze Endpoint ===============");
    if (!req.file) {
      return res.status(400).send("No audio file uploaded");
    }
    logWithTimestamp("Step One: Getting audio file ...");
    // Only on production
    const audioFilePath = req.file.path;
    logWithTimestamp("Step Two: Connecting to Whissper Model ...");
    const client = getWhissperClient();

    logWithTimestamp("Step Three: Processsing audio transcript ...");
    const resultText = await client.audio.transcriptions.create({
      model: "whisper",
      language: "he",
      prompt: `
      You are provided with an hebrew audio conversation, transcript it into hebrew transcript.
      If the values are numbers such as אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע עשר אפס transcript it to an regular number representation like 1 2 3 4 5 6 7 8 9 0 etc
      If the numbers are in a row, make sure to write it a single number rather single digits all by themselves

      here is an example
      "אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע"
      Im expecting you to provide the transcript as:
      "123456789"

      If the numbers are not in a row, for example there is a stop between the digits and the conversation switched, present it as a digits and not as single number
      `,
      file: createReadStream(audioFilePath),
    });
    console.log(resultText);

    logWithTimestamp("Step Four: Transcript succefully been generated ...");
    const result = await getJsonFieldsFilled(resultText.text);
    console.log(result);

    logWithTimestamp(
      "Step Eight: Formatting info data into proper JSON file ..."
    );
    const formattedResult = formatModelResponse(result);

    logWithTimestamp(
      "Step Nine: Form data been converted into JSON succefully ..."
    );
    logWithTimestamp("Step Ten: Server responded");
    res.setHeader("Content-Type", "application/json");
    res.send(formattedResult);
  } catch (err) {
    logWithTimestamp("Error analyzing transcript:", err.message);
    res.status(500).send("Server Error");
  }
});

app.post("/final", upload.single("audio"), async (req, res) => {
  try {
    logWithTimestamp("=============== Analyze Endpoint ===============");
    if (!req.file) {
      return res.status(400).send("No audio file uploaded");
    }
    logWithTimestamp("Step One: Getting audio file ...");
    // Only on production
    const audioFilePath = req.file.path;
    logWithTimestamp("Step Two: Connecting to Whissper Model ...");
    const client = getWhissperClient();

    logWithTimestamp("Step Three: Processsing audio transcript ...");
    const resultText = await client.audio.transcriptions.create({
      model: "whisper",
      language: "he",
      prompt: `
      You are provided with an hebrew audio conversation, transcript it into hebrew transcript.
      If the values are numbers such as אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע עשר אפס transcript it to an regular number representation like 1 2 3 4 5 6 7 8 9 0 etc
      If the numbers are in a row, make sure to write it a single number rather single digits all by themselves

      here is an example
      "אחת שתיים שלוש ארבע חמש שש שבע שמונה תשע"
      Im expecting you to provide the transcript as:
      "123456789"

      If the numbers are not in a row, for example there is a stop between the digits and the conversation switched, present it as a digits and not as single number
      `,
      file: createReadStream(audioFilePath),
    });
    console.log(resultText);

    logWithTimestamp("Step Four: Transcript succefully been generated ...");
    const result = await FinalVersionFormFilled(resultText.text);
    console.log(result);

    logWithTimestamp(
      "Step Eight: Formatting info data into proper JSON file ..."
    );
    const formattedResult = formatModelResponse(result);

    logWithTimestamp(
      "Step Nine: Form data been converted into JSON succefully ..."
    );
    logWithTimestamp("Step Ten: Server responded");
    res.setHeader("Content-Type", "application/json");
    res.send(formattedResult);
  } catch (err) {
    logWithTimestamp("Error analyzing transcript:", err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(port, () => logWithTimestamp(`Server is running on port: ${port}`));
