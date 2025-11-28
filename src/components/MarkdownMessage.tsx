import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function MarkdownMessage({ text }: { text: string }) {
  return (
    <div className="markdown-body text-[14px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-gray-800">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-5 space-y-1 text-gray-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-5 space-y-1 text-gray-800">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-snug text-gray-800">{children}</li>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-[13px] text-gray-700">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-white p-3 rounded-lg text-sm overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cb-link underline font-medium"
            >
              {children}
            </a>
          ),
          h3: ({ children }) => (
            <h3 className="text-[16px] font-semibold text-gray-800 mb-1">
              {children}
            </h3>
          ),
          table: ({ children }) => (
            <table className="w-full border-collapse text-sm mb-3">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border px-2 py-1 text-left font-semibold text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-2 py-1 text-gray-800">{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
