import { createRoot } from "react-dom/client";
import { Chatbot } from "./Chatbot";

(function () {
  window.Chatbot = {
    init({ token }) {
      const div = document.createElement("div");
      document.body.appendChild(div);

      createRoot(div).render(<Chatbot token={token} />);
    },
  };
})();
