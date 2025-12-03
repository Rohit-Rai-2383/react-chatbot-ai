import { useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import type { TChatbotInputProps } from "../../utils/types";

export default function ChatInput({ onSend, isDisabled }: TChatbotInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const send = () => {
    const text = value.trim();
    if (!text) return;

    onSend(text);
    setValue("");

    const el = textareaRef.current;
    if (el) el.style.height = "auto";
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 px-4 py-3 space-y-3">
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm">
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm resize-none overflow-hidden"
          placeholder="Type a message..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);

            const el = textareaRef.current;
            if (!el) return;

            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />

        <button
          onClick={send}
          disabled={!value.trim() || isDisabled}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition 
            ${
              value.trim() && !isDisabled
                ? "cb-send-button hover:cb-send-button"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }
          `}
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
