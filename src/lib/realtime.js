import { supabase } from "./supabase.js";

export function syncRealtimeAuth(accessToken) {
  if (accessToken) {
    supabase.realtime.setAuth(accessToken);
  }
}

export function subscribePostgresChanges({
  accessToken,
  channelName,
  table,
  filter,
  onChange,
}) {
  syncRealtimeAuth(accessToken);

  const changeConfig = {
    event: "*",
    schema: "public",
    table,
  };
  if (filter) changeConfig.filter = filter;

  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", changeConfig, onChange)
    .subscribe((status, err) => {
      if (status === "CHANNEL_ERROR") {
        console.error(`Realtime ${channelName}:`, err);
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
