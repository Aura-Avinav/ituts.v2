export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const hasKey = !!key;
    const keyLength = key ? key.length : 0;

    return new Response(JSON.stringify({
        hasKey,
        keyLength,
        envVars: Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET')) // Safe log
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
