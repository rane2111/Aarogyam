import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const knownSymptoms = [
    "fever", "cough", "headache", "vomiting", "nausea",
    "diarrhea", "fatigue", "abdominal pain", "chest pain",
    "dizziness", "itching", "skin rash",
  ];

  const suggestedSymptoms = ["Fever & Headache", "Cough & Fatigue", "Nausea & Vomiting", "Dizziness"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const symptoms = knownSymptoms.filter((sym) =>
      messageText.toLowerCase().includes(sym)
    );

    if (symptoms.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "warning",
          text: "Please enter valid symptoms such as fever, cough, headache, nausea, or dizziness.",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

      const systemPrompt = `You are a medical AI assistant. When given symptoms, respond ONLY with a valid JSON object (no markdown, no extra text) in exactly this format:
{
  "final_prediction": {
    "disease": "<most likely disease name>",
    "confidence": <number between 0 and 1>
  },
  "top_3_predictions": [
    { "disease": "<second possibility>", "confidence": <number between 0 and 1> },
    { "disease": "<third possibility>", "confidence": <number between 0 and 1> },
    { "disease": "<fourth possibility>", "confidence": <number between 0 and 1> }
  ],
  "advice": "<one brief sentence of general advice>"
}`;

      const userPrompt = `Patient symptoms: ${symptoms.join(", ")}. Full description: "${messageText}". Provide a differential diagnosis.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 512,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
      }

      const groqData = await response.json();
      const rawContent = groqData.choices?.[0]?.message?.content ?? "";

      // Strip any accidental markdown fences the model might add
      const jsonStr = rawContent.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      if (!parsed.final_prediction?.disease) {
        throw new Error("Unexpected response format from AI.");
      }

      setMessages((prev) => [...prev, { sender: "bot", type: "result", data: parsed }]);

      if (parsed.advice) {
        setMessages((prev) => [...prev, { sender: "bot", text: `💡 ${parsed.advice}` }]);
      }
    } catch (err: any) {
      console.error("Groq API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          type: "error",
          text: err?.message?.includes("Groq API error")
            ? "AI service returned an error. Please try again."
            : "Unable to connect to AI service. Check your connection and try again.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "'Segoe UI', sans-serif" }} className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div
        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 shadow-sm"
        style={{ backgroundColor: "#59bfb1" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Symptom Checker</h1>
          <p className="text-sm text-white/80">Describe your symptoms and get an AI-based prediction</p>
        </div>

      </div>

      {/* ── Main chat card ── */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col"
        style={{ height: 560 }}
      >
        {/* Card top bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e6f7f5" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#0d9e8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">AI Symptom Analysis</p>

          </div>
          <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#e6f7f5", color: "#0d9e8a" }}>
            Online
          </span>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#e6f7f5" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#0d9e8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium text-sm">How are you feeling today?</p>
                <p className="text-gray-400 text-xs mt-1">Type your symptoms or choose a suggestion below</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedSymptoms.map((s) => (
                  <button key={s}
                    onClick={() => handleSend(`I have ${s.toLowerCase()}`)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{ borderColor: "#0d9e8a", color: "#0d9e8a", backgroundColor: "white" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "#e6f7f5"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "white"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: "#e6f7f5" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#0d9e8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              )}

              {msg.type === "result" ? (
                <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-xs" style={{ backgroundColor: "#f9fefe" }}>
                  <div className="px-4 py-3" style={{ backgroundColor: "#0d9e8a" }}>
                    <p className="text-white text-xs font-medium uppercase tracking-wider">Prediction Result</p>
                    <p className="text-white font-bold text-base mt-0.5">{msg.data.final_prediction.disease}</p>
                  </div>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-xs font-semibold" style={{ color: "#0d9e8a" }}>
                        {(msg.data.final_prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${(msg.data.final_prediction.confidence * 100).toFixed(1)}%`,
                        backgroundColor: "#0d9e8a",
                      }} />
                    </div>
                    {msg.data.final_prediction.confidence < 0.5 && (
                      <p className="text-xs text-amber-500 mt-1.5">💡 Add more symptoms for better accuracy</p>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-medium mb-2">OTHER POSSIBILITIES</p>
                    {msg.data.top_3_predictions.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 py-1">
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                          style={{ backgroundColor: "#e6f7f5", color: "#0d9e8a" }}>{idx + 1}</span>
                        <span className="text-sm text-gray-700">{item.disease}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100">
                    <p className="text-xs text-gray-400">⚕️ Always consult a doctor for diagnosis</p>
                  </div>
                </div>
              ) : msg.type === "warning" ? (
                <div className="rounded-xl px-4 py-2.5 max-w-xs text-sm border"
                  style={{ backgroundColor: "#fff8e6", borderColor: "#f0d060", color: "#92750a" }}>
                  ⚠️ {msg.text}
                </div>
              ) : msg.type === "error" ? (
                <div className="rounded-xl px-4 py-2.5 max-w-xs text-sm border"
                  style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }}>
                  ❌ {msg.text}
                </div>
              ) : msg.sender === "bot" ? (
                <div className="rounded-xl px-4 py-2.5 max-w-xs text-sm bg-gray-50 text-gray-700 border border-gray-100">
                  {msg.text}
                </div>
              ) : (
                <div className="rounded-xl px-4 py-2.5 max-w-xs text-sm text-white" style={{ backgroundColor: "#0d9e8a" }}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-center gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#e6f7f5" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#0d9e8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="rounded-xl px-4 py-2.5 bg-gray-50 border border-gray-100 flex items-center gap-2">
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full inline-block animate-bounce"
                      style={{ backgroundColor: "#0d9e8a", animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
                <span className="text-xs text-gray-400">Analyzing symptoms...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. I have fever and headache..."
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-gray-50"
              onFocus={(e) => { e.target.style.borderColor = "#0d9e8a"; e.target.style.backgroundColor = "white"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white disabled:opacity-40"
              style={{ backgroundColor: "#0d9e8a" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
