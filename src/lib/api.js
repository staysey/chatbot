import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function fetchChats(headers) {
  const { data } = await axios.get(`${API_BASE}/api/chats`, { headers });
  return Array.isArray(data) ? data : [];
}

export async function createChat(headers, title = "New chat") {
  const { data } = await axios.post(
    `${API_BASE}/api/chats`,
    { title },
    { headers },
  );
  return data;
}

export async function deleteChat(headers, chatId) {
  await axios.delete(`${API_BASE}/api/chats/${chatId}`, { headers });
}

export async function fetchMessages(headers, chatId) {
  const { data } = await axios.get(
    `${API_BASE}/api/chats/${chatId}/messages`,
    { headers },
  );
  return Array.isArray(data) ? data : [];
}

export async function saveMessage(
  headers,
  { chat_id, sender, content, files = [] },
) {
  const url = `${API_BASE}/api/chats/${chat_id}/messages`;
  if (files.length > 0) {
    const form = new FormData();
    form.append("sender", sender);
    form.append("content", content);
    for (const file of files) form.append("files", file);
    const { data } = await axios.post(url, form, { headers });
    return data;
  }
  const { data } = await axios.post(url, { sender, content }, { headers });
  return data;
}

export async function postAiChat(headers, chatId, message, files = []) {
  const formData = new FormData();
  formData.append("message", message);
  for (const file of files) formData.append("files", file);
  const { data } = await axios.post(
    `${API_BASE}/api/chats/${chatId}`,
    formData,
    { headers },
  );
  return data;
}

function authErrorMessage(err) {
  return err.response?.data?.error || err.message || "Something went wrong";
}

export async function login(email, password) {
  try {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password,
    });
    return { session: data, error: null };
  } catch (err) {
    return { session: null, error: authErrorMessage(err) };
  }
}

export async function signUp(email, password) {
  try {
    const { data, status } = await axios.post(`${API_BASE}/api/auth/signup`, {
      email,
      password,
    });
    if (status === 201 && data?.message && !data.access_token) {
      return { session: null, error: null, message: data.message };
    }
    return { session: data, error: null, message: null };
  } catch (err) {
    return { session: null, error: authErrorMessage(err), message: null };
  }
}

export async function fetchSession(accessToken) {
  try {
    const { data } = await axios.get(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { session: data, error: null };
  } catch {
    return { session: null, error: "Unauthorized" };
  }
}

export async function logout(headers) {
  try {
    await axios.post(`${API_BASE}/api/auth/logout`, {}, { headers });
  } catch {
    /* still clear local session */
  }
}
