import {
  type CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import MonacoEditor from "@monaco-editor/react";
import { TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: (language, meta) => true,
  priority: 0,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();

    const lineCount = props.code.split("\n").length;
    const lineHeight = 20;
    const maxHeight = 500;
    const height = Math.min(lineCount * lineHeight, maxHeight);

    const handleDelete = () => {
      cb.parentEditor.update(() => {
        cb.lexicalNode.remove();
      });
    };

    const language = props.language ?? "plaintext";

    return (
      <div
        onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}
        className="flex flex-col bg-gray-800"
      >
        <div className="flex w-full justify-between">
          <Select
            defaultValue={language}
            value={language}
            onValueChange={(value) => {
              cb.setLanguage(value ?? "plaintext");
            }}
          >
            <SelectTrigger className="max-w-48">
              <SelectValue
                className="text-white"
                placeholder="Select a language"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plaintext">Plain Text</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
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
          language={props.language[1]}
          value={props.code}
          onChange={(value) => cb.setCode(value ?? "")}
          theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    );
  },
};
