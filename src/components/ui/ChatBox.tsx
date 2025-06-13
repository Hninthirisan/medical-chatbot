"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react"

type Message = { role: "user" | "bot"; text: string };
type QAResult = {
  patient_question: string;
  doctor_response: string;
  similarity?: number;
};


export default function ChatBox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user" as const, text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();

    let botText = "No relevant answer found.";
    if (data.answer) {
      botText = data.answer;
    } else if (data.results && data.results.length > 0) {
      botText = data.results
        .map(
          (r: QAResult, i: number) =>
            `Q: ${r.patient_question}\nA: ${r.doctor_response}`
        )
        .join("\n\n");
    }

    setMessages([...newMessages, { role: "bot", text: botText }]);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 z-20">
      <ScrollArea className="h-120 p-4 border rounded-4xl bg-sky-600/10">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}>
            <motion.span
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1, type: "spring" }}
              className={`inline-block px-4 py-2 rounded ${
                msg.role === "user"
                  ? "bg-blue-800/50 text-white text-lg rounded-3xl shadow-blue-300/30 shadow-md"
                  : "bg-rose-500/50 text-gray-100 text-lg rounded-3xl shadow-rose-300/30 shadow-md "
              }`}>
              {msg.role === "bot" ? formatBotText(msg.text) : msg.text}
            </motion.span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleSend();
          }}
        />

        <Button onClick={handleSend} disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

//helper function to format messages
function formatBotText(text: string): React.JSX.Element[] {
  // Remove Markdown headings (**, ##, etc)
  let clean = text
    .replace(/[*_`#>]/g, "") // remove basic markdown chars
    .replace(/\n\s*\n/g, "</p><p>") // split paragraphs
    .replace(/\n/g, "<br />"); // remaining newlines as breaks

  // Wrap in <p> tags for paragraph spacing
  clean = `<p>${clean}</p>`;

  // Use dangerouslySetInnerHTML only for trusted content!
  // For AI output, this is generally safe as it never contains scripts.
  return [<span dangerouslySetInnerHTML={{ __html: clean }} key="f" />];
}
