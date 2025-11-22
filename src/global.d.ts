export {};

declare global {
  interface Window {
    Chatbot: {
      init: (config: { token: string; socketUrl: string }) => void;
    };
  }
}
