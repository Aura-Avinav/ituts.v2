import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp"
];

async function run() {
    let log = "MODEL DIAGNOSTICS RESULTS:\n";

    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("hello");
            log += `✅ ${m}: SUCCESS\n`;
        } catch (e) {
            log += `❌ ${m}: FAILED (${e.message.split('[')[0]})\n`;
        }
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync('results.txt', log);
    console.log("Done. Results written to results.txt");
}

run();
