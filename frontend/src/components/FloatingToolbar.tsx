import Icon from "@/components/ui/Icon";
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
      } else {
        insert = `**${text || "texto"}**`;
      }
      break;
    }
    case "italic": {
      if (text.startsWith("*") && text.endsWith("*") && !text.startsWith("**")) {
        insert = text.slice(1, -1);
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
  icon: "bold" | "italic" | "heading-1" | "link" | "list" | "code-2";
  title: string;
}[] = [
  { action: "bold", icon: "bold", title: "Negrito" },
  { action: "italic", icon: "italic", title: "Itálico" },
  { action: "heading", icon: "heading-1", title: "Título" },
  { action: "link", icon: "link", title: "Link" },
  { action: "list", icon: "list", title: "Lista" },
  { action: "code", icon: "code-2", title: "Código inline" },
];

export default function FloatingToolbar() {
  const floating = useAppStore((s) => s.floatingToolbar);
  const editor = useAppStore((s) => s.editor);

  if (!floating.visible || !editor) return null;

  return (
    <div
      id="floating-toolbar"
      className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1 animate-slide-down"
      style={{
        top: `${floating.top}px`,
        left: `${floating.left}px`,
        transform: "translateX(-50%)",
        backgroundColor: "var(--color-accent)",
        border: "var(--border-width) solid var(--color-border)",
        boxShadow: "var(--shadow)",
        borderRadius: 6,
        opacity: floating.visible ? 1 : 0,
      }}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={cancelHide}
    >
      {buttons.map(({ action, icon, title }) => (
        <button
          key={action}
          onMouseDown={(e) => {
            e.preventDefault();
            if (editor) applyFormat(editor, action);
          }}
          className="btn-press p-1.5"
          title={title}
          style={{ color: "#ffffff" }}
        >
          <Icon name={icon} size={16} />
        </button>
      ))}
    </div>
  );
}
