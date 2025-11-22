"use client";

import MarkdownMessage from "./MarkdownMessage";
import BotProcessing from "./BotProcessing";
import { role } from "../utils/constants";

export default function ChatMessages({ messages }) {
  return (
    <>
      {messages.map((m, i) => {
        const isUser = m.role === role.USER_ROLE;
        const isProcessing = m.role === role.PROCESSING_ROLE;
        const isError = m.role === role.ERROR_ROLE;

        return (
          <div key={i} className="space-y-1">
            <p
              className={`text-[11px] text-gray-500 ${
                isUser ? "text-right" : "text-left"
              }`}
            >
              {isUser ? "You" : "Bot"}
            </p>
            <div
              className={`flex items-start gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shadow">
                  🤖
                </div>
              )}
              <div className="max-w-[90%]">
                {isProcessing && !isError ? (
                  <BotProcessing text={m.content} />
                ) : isError ? (
                  <div className="px-4 py-2 rounded-2xl bg-red-100 text-red-800 border border-red-300 text-[14px]">
                    {m.content}
                  </div>
                ) : isUser ? (
                  <div className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-[14px] leading-relaxed">
                    {m.content}
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm text-[14px] leading-relaxed">
                    <MarkdownMessage text={m.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
