/** Supabase email links redirect with session tokens in the URL hash. */
export function parseAuthHash(hash) {
  if (!hash || hash.length < 2) return null;

  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const error =
    params.get("error_description") || params.get("error") || null;

  if (error) {
    return {
      error: decodeURIComponent(error.replace(/\+/g, " ")),
    };
  }

  const access_token = params.get("access_token");
  if (!access_token) return null;

  return {
    access_token,
    refresh_token: params.get("refresh_token") || undefined,
    expires_at: params.get("expires_in")
      ? Math.floor(Date.now() / 1000) + Number(params.get("expires_in"))
      : undefined,
  };
}

export function clearAuthHash() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", pathname + search);
}
