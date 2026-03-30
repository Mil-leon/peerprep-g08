import { type ReactNode } from "react";
import { Card, CardHeader, CardBody, Select, SelectItem } from "@heroui/react";

const LANGUAGES = [
  { key: "typescript", label: "TypeScript" },
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "java", label: "Java" },
  { key: "cpp", label: "C++" },
];

interface EditorPanelProps {
  /** Drop Monaco Editor (or any other editor) here as a child. */
  children?: ReactNode;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

/**
 * Container for the code editor.
 *
 * Injection point:
 *   Pass <MonacoEditor ...> as `children` once monaco-editor is installed.
 *   The inner div has data-editor="mount" to locate the DOM node easily.
 */
export default function EditorPanel({
  children,
  language = "typescript",
  onLanguageChange,
}: EditorPanelProps) {
  return (
    <Card
      className="flex flex-col h-full rounded-none border-none shadow-none bg-content1"
      aria-label="Code editor panel"
    >
      {/* ── Toolbar ── */}
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 flex-none border-b border-divider gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-default-400 select-none">
          Code Editor
        </span>

        <Select
          aria-label="Select programming language"
          size="sm"
          variant="flat"
          selectedKeys={[language]}
          className="max-w-[160px]"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onLanguageChange?.(selected);
          }}
        >
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.key}>{lang.label}</SelectItem>
          ))}
        </Select>
      </CardHeader>

      {/* ── Editor mount ── */}
      <CardBody className="flex-1 overflow-hidden p-0">
        {children ? (
          // Actual editor injected from parent
          <div data-editor="mount" className="w-full h-full">
            {children}
          </div>
        ) : (
          // Placeholder shown before monaco-editor is wired up
          <div
            data-editor="placeholder"
            className="flex flex-col items-center justify-center w-full h-full gap-4 text-center select-none"
          >
            <span className="text-5xl opacity-20">{"</>"}</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-default-400">
                Editor not yet connected
              </p>
              <p className="text-xs text-default-300">
                Pass{" "}
                <code className="font-mono bg-default-100 px-1 rounded">
                  &lt;MonacoEditor /&gt;
                </code>{" "}
                as a child to activate
              </p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
