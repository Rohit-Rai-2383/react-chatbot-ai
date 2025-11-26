import { responseType, role } from "./constants";

export type TMessage = {
  role: role;
  content: string;
};

export type TParsedRole = {
  type: responseType;
  message: string;
  answer: string;
};

export type TChatbotInputProps = {
  onSend: (text: string) => void;
};

export type TInitProps = {
  token?: string;
  containerId?: string;
  userId?: string;
};

export type TChatBotProps = {
  token: string;
  userId: string;
};
