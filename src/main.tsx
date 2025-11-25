import ReactDOM from "react-dom/client";
import { Chatbot } from "./Chatbot";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Chatbot token="DEV_TOKEN" />
);
