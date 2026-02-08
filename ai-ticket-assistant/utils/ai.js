import { GoogleGenAI } from "@google/genai";

const analyzeTicket = async (ticket) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert AI assistant that processes technical support tickets.

Respond ONLY with valid JSON:
{
  "summary": "1-2 sentence summary",
  "priority": "low|medium|high",
  "helpfulNotes": "Detailed explanation",
  "relatedSkills": ["Python", "React", "Node", "ML", "AI", "Flutter"]
}

Ticket Title: ${ticket.title}
Description: ${ticket.description}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",   // ✅ NEW MODEL
      contents: prompt,
    });

    const text = response.text;

    console.log("🔍 RAW AI RESPONSE:", text);

    if (!text) return null;

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.log("⚠ JSON not detected");
      return null;
    }

    const parsed = JSON.parse(match[0]);

    return {
      summary: parsed.summary || "",
      priority: ["low", "medium", "high"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      helpfulNotes: parsed.helpfulNotes || "",
      relatedSkills: Array.isArray(parsed.relatedSkills)
        ? parsed.relatedSkills
        : [],
    };
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    return null;
  }
};

export default analyzeTicket;
