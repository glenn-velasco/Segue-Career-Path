"use server"

import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';

export async function handleResume(formData: FormData) {
    try {
        const file = formData.get("resume") as File | null;
        const portfolioUrl = formData.get("portfolioUrl") as string | null;

        let extractedText = "";

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            if (file.name.endsWith('.pdf')) {
                const parser = new PDFParse({ data: buffer });
                const pdfData = await parser.getText();
                extractedText = pdfData.text;
            } else if (file.name.endsWith('.docx')) {
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            } else {
                return { error: "Unsupported file type. Please upload a PDF or DOCX." };
            }
        }
        else if (portfolioUrl) {
            try {
                const urlToFetch = portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`;
                const res = await fetch(urlToFetch, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (!res.ok) return { error: "Failed to fetch portfolio website." };
                const html = await res.text();
                const $ = cheerio.load(html);
                extractedText = $('body').text().replace(/\s+/g, ' ');
            } catch (err) {
                return { error: "Could not read portfolio website. Make sure it's a valid public URL." };
            }
        } else {
            return { error: "Please provide a resume file or portfolio URL." };
        }

        if (!extractedText || extractedText.trim().length < 20) {
            return { error: "Not enough text content found to analyze your expertise." };
        }

        let searchQuery = "";
        let detectedExpertise = "";

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (apiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `Analyze this resume/portfolio text and extract the primary job title or core expertise in exactly 1 to 3 words. Respond ONLY with the job title. (e.g., 'Software Engineer', 'Data Scientist', 'Marketing Manager').\n\nText:\n${extractedText.substring(0, 15000)}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                if (response.text) {
                    searchQuery = response.text.trim().replace(/[".]/g, '');
                    detectedExpertise = searchQuery;
                }
            } catch (e) {
                console.error("Gemini failed, using fallback", e);
            }
        } else {
            console.warn("No GEMINI_API_KEY found. Falling back to default search.");
        }

        const res = await fetch(
            `https://jobstreet.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&countryCode=my`,
            {
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY || "",
                    'x-rapidapi-host': 'jobstreet.p.rapidapi.com'
                }
            }
        )

        if (!res.ok) {
            return { error: "Failed to fetch jobs from Jobstreet API." }
        }

        const data = await res.json()
        const jobs = data.data || (Array.isArray(data) ? data : (data.results || []));

        return { data: jobs, expertise: detectedExpertise }

    } catch (err: any) {
        console.error(err);
        return { error: err.message || "An unexpected error occurred during processing." };
    }
}