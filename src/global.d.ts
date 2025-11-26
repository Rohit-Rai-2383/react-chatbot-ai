export {};
import { TInitProps } from "../utils/types";
declare global {
  interface Window {
    Chatbot: {
      init: (cfg: TInitProps) => void;
      destroy?: () => void;
    };
  }
}
