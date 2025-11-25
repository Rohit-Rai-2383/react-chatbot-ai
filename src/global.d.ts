export {};

declare global {
  interface Window {
    Chatbot: {
      init: (cfg: { token?: string; containerId?: string }) => void;
      destroy?: () => void;
    };
  }
}
