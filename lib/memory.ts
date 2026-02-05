import { supabase } from "@/lib/db";

export async function getMemory(sessionId: string) {
  const { data } = await supabase
    .from("chat_memory")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  return data;
}

export async function saveMemory(
  sessionId: string,
  memory: {
    city?: string;
    last_topic?: string;
  }
) {
  await supabase
    .from("chat_memory")
    .upsert({
      session_id: sessionId,
      ...memory,
      updated_at: new Date(),
    });
}