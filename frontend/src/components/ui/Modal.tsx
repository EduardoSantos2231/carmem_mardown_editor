import { useState, useCallback } from "react";

let modalState: {
  show: (title: string, placeholder: string, cb: (value: string) => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: (() => void) | null,
    isDanger?: boolean
  ) => void;
} = { show: () => {}, showConfirm: () => {} };

export function showModal(
  title: string,
  placeholder: string,
  callback: (value: string) => void
) {
  modalState.show(title, placeholder, callback);
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: (() => void) | null,
  isDanger?: boolean
) {
  modalState.showConfirm(title, message, onConfirm, onCancel, isDanger);
}

export default function Modal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"prompt" | "confirm">("prompt");
  const [title, setTitle] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("");
  const [danger, setDanger] = useState(false);
  const [cb, setCb] = useState<((v: string) => void) | null>(null);
  const [confirmCb, setConfirmCb] = useState<(() => void) | null>(null);
  const [cancelCb, setCancelCb] = useState<(() => void) | null>(null);

  modalState.show = useCallback((t: string, p: string, c: (v: string) => void) => {
    setMode("prompt");
    setTitle(t);
    setPlaceholder(p);
    setValue(p);
    setCb(() => c);
    setOpen(true);
  }, []);

  modalState.showConfirm = useCallback(
    (
      t: string,
      m: string,
      onConfirm: () => void,
      onCancel?: (() => void) | null,
      isDanger?: boolean
    ) => {
      setMode("confirm");
      setTitle(t);
      setMessage(m);
      setDanger(!!isDanger);
      setConfirmCb(() => onConfirm);
      setCancelCb(() => onCancel || null);
      setOpen(true);
    },
    []
  );

  const close = () => setOpen(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div
        className="rounded-lg w-96 p-6 glass-surface-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "var(--border-width) solid var(--color-border)",
        }}
      >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {mode === "confirm" ? (
          <>
            <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  cancelCb?.();
                  close();
                }}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{
                  backgroundColor: "transparent",
                  border: "var(--border-width) solid var(--color-border)",
                  color: "var(--color-text)",
                  boxShadow: "var(--shadow-hard)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmCb?.();
                  close();
                }}
                className="px-4 py-2 rounded text-sm text-white transition-colors"
                style={{
                  backgroundColor: danger ? "#dc2626" : "var(--color-accent)",
                  boxShadow: "var(--shadow-hard)",
                }}
              >
                Confirmar
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) {
                  cb?.(value.trim());
                  close();
                }
                if (e.key === "Escape") close();
              }}
              autoFocus
              className="w-full px-3 py-2 rounded mb-4 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "var(--border-width) solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={close}
                className="px-4 py-2 rounded text-sm transition-colors"
                style={{
                  backgroundColor: "transparent",
                  border: "var(--border-width) solid var(--color-border)",
                  color: "var(--color-text)",
                  boxShadow: "var(--shadow-hard)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (value.trim()) {
                    cb?.(value.trim());
                    close();
                  }
                }}
                className="px-4 py-2 rounded text-sm text-white transition-colors"
                style={{ backgroundColor: "var(--color-accent)", boxShadow: "var(--shadow-hard)" }}
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
