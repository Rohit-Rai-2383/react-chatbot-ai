import { useEffect, useRef, useState } from "react";
import { role, responseType } from "../utils/constants";
import type { TChatBotProps, TMessage, TParsedRole } from "../utils/types";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";
import { config } from "./config";

export function Chatbot({ token, userId, theme }: TChatBotProps) {
  const TOKEN = token || "";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TMessage[]>([
    {
      role: role.BOT_ROLE,
      content:
        theme?.initialMessage ||
        "Hello! I am your helping hand. How can I assist you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasSentAuth = useRef(false);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }, 30);
  }, [messages, loading]);

  const openSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(config.socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS Connected");

      if (!hasSentAuth.current) {
        ws.send(JSON.stringify({ type: responseType.AUTH, token: TOKEN }));
        hasSentAuth.current = true;
        console.log("AUTH sent");
      }
    };

    ws.onmessage = (event) => {
      setLoading(false);

      let parsed: TParsedRole | null = null;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        setMessages((m) => [
          ...m,
          { role: role.ERROR_ROLE, content: "Invalid server response." },
        ]);

        return;
      }

      if (parsed?.type === responseType.PROCESSING) {
        if (processingTimeoutRef.current)
          clearTimeout(processingTimeoutRef.current);

        setMessages((prev) =>
          prev.filter((msg) => msg.role !== role.PROCESSING_ROLE)
        );

        setMessages((prev) => [
          ...prev,
          { role: role.PROCESSING_ROLE, content: parsed.message },
        ]);

        startProcessingTimeout();
        return;
      }

      if (parsed?.type === responseType.RESPONSE) {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }

        setMessages((prev) =>
          prev.filter((msg) => msg.role !== role.PROCESSING_ROLE)
        );

        streamBotResponse(parsed.answer);
        return;
      }

      if (parsed?.type === responseType.ERROR) {
        setMessages((m) => [
          ...m,
          { role: role.ERROR_ROLE, content: parsed.message },
        ]);
        return;
      }
    };

    ws.onerror = () => {
      setMessages((m) => [
        ...m,
        {
          role: role.ERROR_ROLE,
          content: "WebSocket error occurred.",
        },
      ]);
    };

    ws.onclose = () => console.log("WS Closed");
  };

  const send = (text: string) => {
    setMessages((m) => [...m, { role: role.USER_ROLE, content: text }]);
    setLoading(true);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS NOT READY → connecting again...");
      openSocket();
      return;
    }

    wsRef.current.send(
      JSON.stringify({ type: responseType.QUERY, query: text })
    );
  };

  const streamBotResponse = (fullText: string) => {
    let index = 0;

    setMessages((prev) => [
      ...prev,
      { role: role.BOT_STREAM_ROLE, content: "" },
    ]);

    const interval = setInterval(() => {
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];

        if (lastMsg.role === role.BOT_STREAM_ROLE) {
          lastMsg.content = fullText.slice(0, index);
        }

        return updated;
      });

      if (index >= fullText.length) {
        clearInterval(interval);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: role.BOT_ROLE,
            content: fullText,
          };
          return updated;
        });
      }
    }, 6);
  };

  const startProcessingTimeout = () => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => {
        const filtered = prev.filter(
          (msg) => msg.role !== role.PROCESSING_ROLE
        );
        return [
          ...filtered,
          {
            role: role.PROCESSING_ROLE,
            content: "Still working… this is taking longer than usual.",
          },
        ];
      });
    }, 15000);
  };

  if (!token || !config.allowedUsers.includes(userId)) return null;

  return (
    <>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) openSocket();
        }}
        className="fixed bottom-6 right-6 w-14 h-14 cb-button cb-radius text-cb-user flex items-center justify-center shadow-xl z-50"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-28 right-6 w-[380px] h-[420px] cb-container rounded-2xl shadow-xl border cb-bubble-border flex flex-col z-50 overflow-hidden">
          <div className="cb-header px-4 py-3 flex justify-between items-center sticky top-0 z-10">
            <span className="font-semibold">FK Bot</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-6"
          >
            <ChatMessages messages={messages} />
          </div>

          <ChatInput onSend={send} />
        </div>
      )}
    </>
  );
}
