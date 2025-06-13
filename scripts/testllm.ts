require("dotenv").config();

async function askLLM(prompt: string): Promise<string> {
  const res = await fetch("https://api.llmapi.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.LLMAPI_KEY}`,
      "accept": "*/*",
    },
    body: JSON.stringify({
      model: "deepseek-v3",
      messages: [
        {
          role: "system",
          content: "You are a helpful, trustworthy medical assistant. Guide the user with safe and clear answers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  console.log("LLM API raw response:", data);
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    return data.choices[0].message.content.trim();
  }
  return data.error || "Sorry, the LLM could not generate a response.";
}

(async () => {
  const result = await askLLM("What is diabetes?");
  console.log("\nGenerated answer:", result);
})();
