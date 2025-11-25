import { useState } from "react";
import { ArrowUp } from "lucide-react";
import type { TChatbotInputProps } from "../../utils/types";

export default function ChatInput({ onSend }: TChatbotInputProps) {
  const [value, setValue] = useState("");

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 px-4 py-3 space-y-3">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow-sm">
        <input
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Type a message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button
          onClick={send}
          disabled={!value.trim()}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition 
            ${
              value.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
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
