import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { Chatbot } from "./Chatbot";
import "./index.css";

(function () {
  let root: Root | null = null;

  function init(cfg: { token?: string; containerId?: string } = {}) {
    const { token, containerId } = cfg;

    let container: HTMLElement | null = null;

    if (containerId) {
      container = document.getElementById(containerId);
    }

    if (!container) {
      container = document.getElementById("chatbot-widget-root") as HTMLElement;
      if (!container) {
        container = document.createElement("div");
        container.id = "chatbot-widget-root";
        document.body.appendChild(container);
      }
    }

    if (!root) {
      root = createRoot(container);
    }

    root.render(<Chatbot token={token || ""} />);
  }

  function destroy() {
    if (root) {
      root.unmount();
      root = null;
    }
  }

  window.Chatbot = { init, destroy };
})();
