import { useEffect, useRef, useState } from "react";
import { role, responseType } from "../utils/constants";
import type { TChatBotProps, TMessage, TParsedRole } from "../utils/types";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";
import { config } from "./config";

const LIMIT = 15;

const mapApiHistory = (rows: any[]): TMessage[] => {
  const mapped: TMessage[] = [];

  rows.forEach((item) => {
    if (item.question) {
      mapped.push({
        role: role.USER_ROLE,
        content: item.question,
      });
    }
    if (item.answer) {
      mapped.push({
        role: role.BOT_ROLE,
        content: item.answer,
      });
    }
  });

  return mapped;
};

export function Chatbot({ token, userId, theme }: TChatBotProps) {
  const TOKEN = token || "";

  const [initialLoading, setInitialLoading] = useState(true);
  const isInitialScrollDone = useRef(false);

  // HISTORY PAGINATION
  const [offset, setOffset] = useState(0);

  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const isLoadingHistoryRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TMessage[]>([
    {
      role: role.BOT_ROLE,
      content:
        theme?.initialMessage ||
        "Hello! I am your helping hand. How can I assist you today?",
    },
  ]);
  const [streamText, setStreamText] = useState<string | null>(null);

  const [chatBotLoading, setChatBotLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasSentAuth = useRef(false);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      let parsed: TParsedRole | null = null;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        setMessages((m) => [
          ...m,
          { role: role.ERROR_ROLE, content: "Invalid server response." },
        ]);
        setChatBotLoading(false);

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
      setChatBotLoading(false);
    };

    ws.onclose = (e) => {
      console.log("WS Closed", e);
      setChatBotLoading(false);
      setIsStreaming(false);
      hasSentAuth.current = false;
    };
  };

  const send = (text: string) => {
    setMessages((m) => [...m, { role: role.USER_ROLE, content: text }]);
    setChatBotLoading(true);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS NOT READY → connecting again...");
      openSocket();
      setChatBotLoading(false);
      return;
    }

    wsRef.current.send(
      JSON.stringify({ type: responseType.QUERY, query: text })
    );
  };

  const streamBotResponse = (fullText: string) => {
    let index = 0;
    setIsStreaming(true);
    setChatBotLoading(false);

    setStreamText("");

    const interval = setInterval(() => {
      index++;
      setStreamText(fullText.slice(0, index));

      requestAnimationFrame(scrollToBottom);

      if (index >= fullText.length) {
        clearInterval(interval);

        setMessages((prev) => [
          ...prev,
          { role: role.BOT_ROLE, content: fullText },
        ]);

        setStreamText(null);
        setIsStreaming(false);
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

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const fetchHistory = async (offsetValue: number) => {
    try {
      const params = new URLSearchParams({
        user_id: String(userId),
        offset: String(offsetValue),
        limit: String(LIMIT),
      });

      const res = await fetch(
        `http://192.168.100.140:4000/chat-history?${params.toString()}`
      );
      const raw = await res.json();

      if (!Array.isArray(raw)) return { raw: [], mapped: [] };

      return {
        raw,
        mapped: mapApiHistory(raw),
      };
    } catch (e) {
      console.error(e);
      return { raw: [], mapped: [] };
    }
  };

  const loadOlderHistory = async () => {
    if (isLoadingHistoryRef.current || !hasMoreHistory) return;

    const el = scrollRef.current;
    if (!el) return;

    isLoadingHistoryRef.current = true;
    const oldHeight = el.scrollHeight;

    const { raw, mapped } = await fetchHistory(offset);

    if (raw.length === 0) {
      setHasMoreHistory(false);
      isLoadingHistoryRef.current = false;
      return;
    }

    setMessages((prev) => [...mapped, ...prev]);

    setOffset((prev) => prev + raw.length);

    requestAnimationFrame(() => {
      // Restore scroll position
      const newHeight = el.scrollHeight;
      el.scrollTop = newHeight - oldHeight;
      isLoadingHistoryRef.current = false;
    });
  };

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = null;
      }
      setChatBotLoading(false);
      setIsStreaming(false);
    };
  }, []);

  if (!token || !config.allowedUsers.includes(userId)) return null;

  return (
    <>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            setInitialLoading(true);

            // Fetch offset 0
            fetchHistory(0).then(({ raw, mapped }) => {
              if (mapped.length < LIMIT) {
                setHasMoreHistory(false);
              }
              // HISTORY BEFORE WELCOME (or current messages)
              // IMPORTANT: The user wants history first.
              setMessages((prev) => [...mapped, ...prev]);

              setInitialLoading(false);
              setOffset(raw.length);

              openSocket();

              // Scroll to bottom after initial load
              requestAnimationFrame(() => {
                scrollToBottom();
                isInitialScrollDone.current = true;
              });
            });

            return;
          }
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
            onScroll={() => {
              if (!isInitialScrollDone.current) return;
              if (scrollRef.current?.scrollTop! <= 30) loadOlderHistory();
            }}
            className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-6"
          >
            {initialLoading ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                Loading messages...
              </div>
            ) : (
              <ChatMessages messages={messages} streamText={streamText} />
            )}
          </div>

          <ChatInput onSend={send} isDisabled={chatBotLoading || isStreaming} />
        </div>
      )}
    </>
  );
}
