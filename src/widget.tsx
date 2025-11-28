import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { Chatbot } from "./Chatbot";
import "./index.css";
import type { TInitProps, TTheme } from "../utils/types";

(function () {
  let root: Root | null = null;

  function applyTheme(theme: TTheme = {}) {
    const style = document.documentElement.style;

    const mappings = {
      "--cb-primary": theme.primary || "#000",
      "--cb-secondary": theme.secondary,
      "--cb-text": theme.textColor,
      "--cb-user-bg": theme.userBubbleColor,
      "--cb-user-text": theme.userTextColor,
      "--cb-bot-bg": theme.botBubbleColor,
      "--cb-bot-text": theme.botTextColor,
      "--cb-radius": theme.borderRadius,
      "--cb-font": theme.fontFamily,
    };

    Object.entries(mappings).forEach(([key, value]) => {
      if (value) style.setProperty(key, value);
    });
  }

  function init(cfg: TInitProps = {}) {
    const { token, containerId, userId, theme } = cfg;

    if (!token || !userId) {
      console.warn("Chatbot: Skipped init because token or userId missing.");
      return;
    }

    if (theme) applyTheme(theme);

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

    root.render(<Chatbot token={token || ""} userId={userId || ""} />);
  }

  function destroy() {
    if (root) {
      root.unmount();
      root = null;
    }
  }

  window.Chatbot = { init, destroy };
})();
