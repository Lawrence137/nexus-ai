"use client";

import { useState, type ReactNode } from "react";
import {
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

import type { ChatMessage } from "@/types/chat";

type Props = {
  message: ChatMessage;
  onRegenerate?: () => void;
};

type CodeBlockProps = {
  children: ReactNode;
  className?: string;
  code: string;
};

function getTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    return getTextContent(
      (node as { props: { children?: ReactNode } }).props.children
    );
  }

  return "";
}

function CodeBlock({
  children,
  className,
  code,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const language =
    className?.match(/language-([\w-]+)/)?.[1] ?? "code";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }

  return (
    <div className="my-4 w-full max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#101013]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {language}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy code
            </>
          )}
        </button>
      </div>

      <pre className="m-0 w-full max-w-full overflow-x-auto whitespace-pre p-4 text-sm leading-6">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function MessageBubble({
  message,
  onRegenerate,
}: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function handleCopyResponse() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy response:", error);
    }
  }

  return (
    <div
      className={`flex w-full min-w-0 gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
          <Bot size={17} />
        </div>
      )}

      <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
        <div
          className={`min-w-0 rounded-2xl px-4 py-3 text-sm leading-7 ${
            isUser
              ? "whitespace-pre-wrap break-words bg-violet-600 text-white"
              : "overflow-hidden border border-white/10 bg-white/[0.04] text-zinc-200"
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <div
              className="
                w-full min-w-0 break-words
                [&_a]:text-violet-400
                [&_a]:underline
                [&_blockquote]:my-3
                [&_blockquote]:border-l-2
                [&_blockquote]:border-violet-500
                [&_blockquote]:pl-4
                [&_blockquote]:text-zinc-400
                [&_h1]:mb-3
                [&_h1]:mt-5
                [&_h1]:text-xl
                [&_h1]:font-bold
                [&_h2]:mb-3
                [&_h2]:mt-5
                [&_h2]:text-lg
                [&_h2]:font-semibold
                [&_h3]:mb-2
                [&_h3]:mt-4
                [&_h3]:font-semibold
                [&_hr]:my-5
                [&_li]:ml-5
                [&_li]:list-disc
                [&_ol_li]:list-decimal
                [&_p]:mb-3
                [&_table]:my-4
                [&_table]:w-full
                [&_td]:border
                [&_td]:border-white/10
                [&_td]:p-2
                [&_th]:border
                [&_th]:border-white/10
                [&_th]:bg-white/5
                [&_th]:p-2
              "
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre({ children }) {
                    return <>{children}</>;
                  },

                  code({ children, className }) {
                    const isBlock = Boolean(className);

                    if (isBlock) {
                      const code = getTextContent(children).replace(/\n$/, "");

                      return (
                        <CodeBlock
                          className={className}
                          code={code}
                        >
                          {children}
                        </CodeBlock>
                      );
                    }

                    return (
                      <code className="break-words rounded bg-black/30 px-1.5 py-0.5 text-violet-300">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyResponse}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
              aria-label="Copy response"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>

            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                aria-label="Regenerate response"
                title="Regenerate response"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-zinc-300">
          <User size={17} />
        </div>
      )}
    </div>
  );
}
