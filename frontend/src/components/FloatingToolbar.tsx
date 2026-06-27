import {
  Bold,
  Italic,
  Link,
  List,
  Code2,
  Heading1,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { markUnsaved } from "@/hooks/useAutosave";
import { cancelHide } from "@/lib/floating-toolbar-plugin";

type FormatAction = "bold" | "italic" | "heading" | "link" | "list" | "code";

function applyFormat(view: NonNullable<ReturnType<typeof useAppStore.getState>["editor"]>, action: FormatAction) {
  const { state } = view;
  const sel = state.selection.main;
  const text = state.doc.sliceString(sel.from, sel.to);
  let insert = "";
  let from = sel.from;
  let to = sel.to;

  switch (action) {
    case "bold": {
      if (text.startsWith("**") && text.endsWith("**")) {
        insert = text.slice(2, -2);
        from = sel.from;
        to = sel.to;
      } else {
        insert = `**${text || "texto"}**`;
      }
      break;
    }
    case "italic": {
      if (text.startsWith("*") && text.endsWith("*") && !text.startsWith("**")) {
        insert = text.slice(1, -1);
        from = sel.from;
        to = sel.to;
      } else {
        insert = `*${text || "texto"}*`;
      }
      break;
    }
    case "heading": {
      const line = state.doc.lineAt(sel.from);
      if (line.text.startsWith("# ")) {
        insert = line.text.slice(2);
        from = line.from;
        to = line.to;
      } else {
        insert = `# ${text || line.text}`;
        from = line.from;
        to = line.to;
      }
      break;
    }
    case "link": {
      if (text.startsWith("[") && text.includes("](")) {
        const inner = text.match(/^\[(.+?)\]\((.+?)\)$/);
        if (inner) {
          insert = inner[1];
          from = sel.from;
          to = sel.to;
        }
      } else {
        insert = `[${text || "link"}](url)`;
      }
      break;
    }
    case "list": {
      const line = state.doc.lineAt(sel.from);
      if (line.text.startsWith("- ")) {
        insert = line.text.slice(2);
        from = line.from;
        to = line.to;
      } else {
        insert = `- ${text || line.text}`;
        from = line.from;
        to = line.to;
      }
      break;
    }
    case "code": {
      if (text.startsWith("`") && text.endsWith("`")) {
        insert = text.slice(1, -1);
        from = sel.from;
        to = sel.to;
      } else {
        insert = "`" + (text || "code") + "`";
      }
      break;
    }
  }

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  });
  view.focus();
  markUnsaved();
}

const buttons: {
  action: FormatAction;
  icon: typeof Bold;
  title: string;
}[] = [
  { action: "bold", icon: Bold, title: "Negrito" },
  { action: "italic", icon: Italic, title: "Itálico" },
  { action: "heading", icon: Heading1, title: "Título" },
  { action: "link", icon: Link, title: "Link" },
  { action: "list", icon: List, title: "Lista" },
  { action: "code", icon: Code2, title: "Código inline" },
];

export default function FloatingToolbar() {
  const floating = useAppStore((s) => s.floatingToolbar);
  const editor = useAppStore((s) => s.editor);

  if (!floating.visible || !editor) return null;

  return (
    <div
      id="floating-toolbar"
      className="absolute z-50 glass-panel rounded-xl px-1.5 py-1 flex items-center gap-0.5 shadow-lg transition-all duration-150"
      style={{
        top: `${floating.top}px`,
        left: `${floating.left}px`,
        transform: "translateX(-50%)",
        opacity: floating.visible ? 1 : 0,
      }}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={cancelHide}
    >
      {buttons.map(({ action, icon: Icon, title }) => (
        <button
          key={action}
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor) applyFormat(editor, action);
          }}
          className="p-1.5 rounded-lg transition-colors"
          title={title}
          style={{ color: "var(--color-text-muted)" }}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}
