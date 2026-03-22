import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, jobTitle, companyName, jobDescription } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are Alice, an expert technical recruiter and interviewer. You are conducting a mock interview with a candidate for the position of "${jobTitle}" at "${companyName || 'our company'}". 
        
Job Description context:
${jobDescription || 'Standard requirements for this role.'}

Instructions:
1. Conduct the interview professionally. 
2. Ask ONE question at a time. Do not ask multiple questions in a single response.
3. Wait for the candidate's answer before asking the next question.
4. Evaluate their answer briefly, provide a short encouraging feedback or correction if necessary, and then ask the next relevant question.
5. Keep your responses concise (under 150 words).
6. Start the interview by introducing yourself briefly as Alice and asking the very first question.
7. If the candidate asks to stop or end the interview, conclude gracefully and give the candidate feedback.
8. Stay in Character: Do not answer unrelated or "out-of-character" questions. If the candidate tries to change the subject or ask for help with an answer, politely redirect them back to the interview.`;

        // The Gemini API requires contents to be non-empty. 
        // If it's the start of the interview, provide a seamless starter prompt behind the scenes.
        const chatContents = messages.length > 0 ? messages : [
            { role: 'user', parts: [{ text: "Hello, I'm ready for the interview. Please start." }] }
        ];

        const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
        let response;
        let lastError;

        for (const model of fallbackModels) {
            try {
                response = await ai.models.generateContent({
                    model: model,
                    contents: chatContents,
                    config: {
                        systemInstruction: systemInstruction,
                        temperature: 0.7,
                    }
                });
                
                if (response?.text) {
                    break;
                }
            } catch (error: any) {
                console.warn(`Model ${model} failed, trying next...`, error.message);
                lastError = error;
            }
        }

        if (response?.text) {
            return NextResponse.json({ text: response.text });
        } else {
            return NextResponse.json({ error: lastError?.message || "All models failed to generate a response" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Interview API Error:", error);
        return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
    }
}
