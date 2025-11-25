import { role } from "./constants";

export type TMessage = {
  role: role;
  content: string;
};

export type TChatbotInputProps = {
  onSend: (text: string) => void;
};
