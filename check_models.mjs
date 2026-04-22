import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Access the model manager (not exposed directly in all SDK versions, 
        // but we can try the direct API call if SDK fails, but let's try a diff method first)
        // actually SDK has getGenerativeModel, but maybe not listModels on the client instance directly
        // usually it is on the GoogleGenerativeAI instance or a separate manager.
        // Let's try to just test a list of known valid model strings instead, 
        // as listModels might require different scopes/setup.

        // Actually, let's just bruteforce the top 5 most likely candidates again 
        // and LOG EXPLICITLY to a file we definitely read.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-001",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        let results = "VALID MODELS:\n";

        for (const modelName of candidates) {
            try {
                process.stdout.write(`Testing ${modelName}... `);
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("Test");
                console.log("OK");
                results += `${modelName}\n`;
            } catch (error) {
                console.log("FAIL", error.message.split('\n')[0]);
            }
        }

        fs.writeFileSync('valid_models.txt', results);
        console.log("Done checking models.");

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

listModels();
