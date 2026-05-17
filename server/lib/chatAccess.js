export async function ownsChat(supabase, userId, chatId) {
  if (!chatId) return false;
  const { data, error } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .eq("user_id", userId)
    .maybeSingle();
  return !error && !!data;
}
