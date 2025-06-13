require("dotenv/config");
const fs = require("fs/promises");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const file = await fs.readFile("./forum_with_embeddings.json", "utf8");
  const data = JSON.parse(file);

  let count = 0;
  for (const entry of data) {
    // Insert into DB
    const { error } = await supabase.from("forum_qa").insert({
      patient_question: entry.patient_question,
      doctor_response: entry.doctor_response,
      embedding: entry.embedding,
      symptoms: entry.symptoms,
    });

    if (error) {
      console.error("Insert error:", error);
    } else {
      count++;
      console.log("Inserted:", entry.patient_question.slice(0, 40));
    }
  }
  console.log(`Done! Inserted ${count} records.`);
}

main().catch(console.error);
