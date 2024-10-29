import {
  type CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import MonacoEditor from "@monaco-editor/react";
import { TrashIcon } from "lucide-react";
import { type editor } from "monaco-editor";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const languageOptions = [
  { value: "bash", label: "Bash" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "go", label: "Go" },
  { value: "html", label: "HTML" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "jsx", label: "JSX" },
  { value: "kotlin", label: "Kotlin" },
  { value: "markdown", label: "Markdown" },
  { value: "php", label: "PHP" },
  { value: "plaintext", label: "Plain Text" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "shell", label: "Shell" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "tsx", label: "TSX" },
  { value: "typescript", label: "TypeScript" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
];

export const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: () => true,
  priority: 0,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const lineCount = props.code.split("\n").length;
    const lineHeight = 20;
    const maxHeight = 500;
    const minHeight = 40;
    const height = Math.min(
      Math.max(lineCount * lineHeight, minHeight),
      maxHeight,
    );

    const handleDelete = () => {
      cb.parentEditor.update(() => {
        cb.lexicalNode.remove();
      });
    };

    const language = props.language ?? "plaintext";

    return (
      <div
        onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        className="flex flex-col gap-2 bg-gray-800"
      >
        <div className="flex w-full justify-between">
          <Select
            defaultValue={language}
            value={language}
            onValueChange={(value) => {
              cb.setLanguage(value ?? "plaintext");
            }}
          >
            <SelectTrigger className="max-w-48 text-white" data-language>
              <SelectValue
                className="text-white"
                placeholder="Select a language"
              />
            </SelectTrigger>
            <SelectContent className="bg-gray-800">
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="self-end"
            onClick={handleDelete}
          >
            <TrashIcon className="text-gray-400" />
          </Button>
        </div>
        <MonacoEditor
          height={`${height}px`}
          language={language}
          value={props.code}
          onChange={(value) => cb.setCode(value ?? "")}
          theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
            padding: { top: 10, bottom: 10 },
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.focus();
          }}
        />
      </div>
    );
  },
};
