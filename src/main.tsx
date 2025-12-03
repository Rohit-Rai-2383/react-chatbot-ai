import ReactDOM from "react-dom/client";
import { Chatbot } from "./Chatbot";
import "./index.css";

const theme = {
  initialMessage: "hello",
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Chatbot token="DEV_TOKEN" userId="" theme={theme} />
);
