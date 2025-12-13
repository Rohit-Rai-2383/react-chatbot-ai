import { useEffect, useRef, useState } from "react";
import { role, responseType } from "../utils/constants";
import type {
  TChatBotProps,
  THistoryItem,
  TMessage,
  TParsedRole,
} from "../utils/types";
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
  const [streamText, setStreamText] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasSentAuth = useRef(false);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const shouldScrollToBottom = useRef(true);
  const previousScrollHeightRef = useRef(0);

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
      shouldScrollToBottom.current = true;
      let parsed: TParsedRole | null = null;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        setMessages((m) => [
          ...m,
          { role: role.ERROR_ROLE, content: "Invalid server response." },
        ]);
        setLoading(false);

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
      setLoading(false);
    };

    ws.onclose = (e) => {
      console.log("WS Closed", e);
      setLoading(false);
      setIsStreaming(false);
      hasSentAuth.current = false;
    };
  };

  const fetchHistory = async () => {
    if (isLoadingHistory || !hasMore) return;
    setIsLoadingHistory(true);
    shouldScrollToBottom.current = false;
    if (scrollRef.current) {
      previousScrollHeightRef.current = scrollRef.current.scrollHeight;
    }

    try {
      const limit = 8;
      const response = await fetch(
        `${config.history_url}?user_id=${userId}&limit=${limit}&offset=${offset}`
      );
      const data = (await response.json()) as THistoryItem[];

      if (Array.isArray(data)) {
        if (data.length < limit) {
          setHasMore(false);
        }

        const orderedData = [...data].reverse();
        const incomingMessages: TMessage[] = orderedData.flatMap((item) => [
          { role: role.USER_ROLE, content: item.question },
          { role: role.BOT_ROLE, content: item.answer },
        ]);

        setMessages((prev) => [...incomingMessages, ...prev]);
        setOffset((prev) => prev + limit);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop } = scrollRef.current;
    if (scrollTop === 0 && hasMore && !isLoadingHistory) {
      fetchHistory();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (
      e.deltaY < 0 &&
      scrollRef.current &&
      scrollRef.current.scrollTop === 0 &&
      hasMore &&
      !isLoadingHistory
    ) {
      fetchHistory();
    }
  };

  const send = (text: string) => {
    shouldScrollToBottom.current = true;
    setMessages((m) => [...m, { role: role.USER_ROLE, content: text }]);
    setLoading(true);

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WS NOT READY → connecting again...");
      openSocket();
      setLoading(false);
      return;
    }

    wsRef.current.send(
      JSON.stringify({ type: responseType.QUERY, query: text })
    );
  };

  const streamBotResponse = (fullText: string) => {
    let index = 0;
    setIsStreaming(true);
    setLoading(false);

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

  useEffect(() => {
    if (shouldScrollToBottom.current) {
      scrollToBottom();
    } else {
      if (scrollRef.current) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        const diff = newScrollHeight - previousScrollHeightRef.current;
        if (diff > 0) {
          scrollRef.current.scrollTop = diff;
        }
      }
    }
  }, [messages]);

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
      setLoading(false);
      setIsStreaming(false);
    };
  }, []);

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
            onScroll={handleScroll}
            onWheel={handleWheel}
          >
            {isLoadingHistory && (
              <div className="flex justify-center p-2">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            )}
            <ChatMessages messages={messages} streamText={streamText} />
          </div>

          <ChatInput onSend={send} isDisabled={loading || isStreaming} />
        </div>
      )}
    </>
  );
}
