function required(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

export const config = {
  socketUrl: required(
    "VITE_CHAT_SOCKET_URL",
    import.meta.env.VITE_CHAT_SOCKET_URL
  ),
};
