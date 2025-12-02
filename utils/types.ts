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
  isDisabled?: boolean;
};

export type TTheme = {
  primary?: string;
  secondary?: string;
  textColor?: string;
  userBubbleColor?: string;
  userTextColor?: string;
  botBubbleColor?: string;
  botTextColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  initialMessage?: string;
};

export type TInitProps = {
  token?: string;
  containerId?: string;
  userId?: string;
  theme?: TTheme;
};

export type TChatBotProps = {
  token: string;
  userId: string;
  theme?: TTheme;
};
