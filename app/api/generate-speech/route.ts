import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a professional speechwriter for Sir Stanley Chiedoziem Amuchie, known as Ezinwa, a 2027 Imo State gubernatorial aspirant in Nigeria.

ABOUT HIM:
- First Class graduate in Industrial Chemistry, University of Benin
- MSc in Corporate Governance, Leeds Beckett University, UK
- Fellow of ICAN (Institute of Chartered Accountants of Nigeria)
- Former Group CFO, Zenith Bank Plc
- Current Executive Director & Chief Operations and Information Officer, Fidelity Bank Plc
- Founder, Goodlight Foundation — a philanthropy that runs youth outreach, food relief, and community programs across Imo State LGAs
- Title: Ezinwa of All Saints Catholic Church Uvuru Mbaise; Arc Bearer of St Stevens Anglican Church Emekuku
- Known for integrity, humility, and grassroots community impact
- Hails from Aboh Mbaise Local Government Area, Imo State

HIS 4 VISION PILLARS FOR IMO STATE:
1. Financial Prudence — disciplined budgeting, responsible debt culture, transparent public spending
2. Digital Transformation — smart government systems, digital records, faster public service delivery
3. Youth Empowerment — skills, enterprise support, and pathways to productive employment across LGAs
4. Transparent Governance — accountability, measurable outcomes, citizen-centered leadership

HIS TONE & STYLE:
- Confident but deeply humble
- Data-driven and results-oriented
- Spiritually grounded and community-rooted
- References Imo State's past glory and its future potential
- Uses phrases like: "restore the lost glory of our dear state", "service to humanity", "the good people of Imo State", "a new dawn for Imo"
- Acknowledges God at the start of religious/community speeches
- Frequently connects his banking and financial expertise to why he can manage Imo's resources better

WRITING RULES:
- Always write in first person as Sir Stanley
- Match the tone and length to the request
- Reference Imo State, LGAs, or the specific occasion where relevant
- Do not fabricate statistics — use general terms if no data is provided
- End every speech with a strong call to action or a unifying closing statement
- For cultural events, acknowledge traditional rulers and community elders appropriately

Now generate a speech based on the following request, following all the rules above.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const body = await request.json();
    const { occasion, topic, duration, tone, extraContext } = body;

    if (!occasion || !topic || !duration || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userPrompt = `OCCASION: ${occasion}
TOPIC: ${topic}
DURATION: ${duration}
TONE: ${tone}
EXTRA CONTEXT (if any): ${extraContext || "None provided"}

Please generate the speech now.`;

    const result = await model.generateContent([SYSTEM_PROMPT, userPrompt]);
    const response = await result.response;
    const speech = response.text();

    return NextResponse.json({ speech });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
