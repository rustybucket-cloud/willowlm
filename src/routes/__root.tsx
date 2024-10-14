import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { MenuIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import {
  BaseDirectory,
  readDir,
  exists,
  mkdir,
  watch,
} from "@tauri-apps/plugin-fs";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const [files, setFiles] = useState<string[]>([]);

  const updateFiles = useCallback(async () => {
    const fs = await readDir("chats", {
      baseDir: BaseDirectory.AppData,
    });
    setFiles(fs.map((f) => f.name));
  }, []);

  useEffect(() => {
    const readFiles = async () => {
      const dirExists = await exists("chats", {
        baseDir: BaseDirectory.AppData,
      });
      if (!dirExists) {
        await mkdir("chats", {
          baseDir: BaseDirectory.AppData,
          recursive: true,
        });
      }

      updateFiles();

      await watch(
        "chats",
        () => {
          updateFiles();
        },
        {
          baseDir: BaseDirectory.AppData,
          delayMs: 500,
        }
      );
    };
    readFiles();
  }, [updateFiles]);

  return (
    <body>
      <Sheet>
        <SheetTrigger className="fixed top-3 left-3">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle>Chats</SheetTitle>
              <Button variant="ghost" size="icon">
                <PlusIcon />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <Button key={file} variant="ghost">
                {getFileName(file)}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <Outlet />
    </body>
  );
}

function getFileName(path: string) {
  const regex = /"([^"]*)"/;
  const match = path.match(regex);

  if (match) {
    return match[1];
  } else {
    return path;
  }
}
