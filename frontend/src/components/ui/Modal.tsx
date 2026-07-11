import { useState, useCallback } from "react";

let modalState: {
  show: (title: string, placeholder: string, cb: (value: string) => void, initialValue?: string) => void;
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
  callback: (value: string) => void,
  initialValue?: string
) {
  modalState.show(title, placeholder, callback, initialValue);
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

  modalState.show = useCallback((t: string, p: string, c: (v: string) => void, init?: string) => {
    setMode("prompt");
    setTitle(t);
    setPlaceholder(p);
    setValue(init || "");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={close}
    >
      <div
        className="panel w-96 p-6"
        style={{ boxShadow: "8px 8px 0 var(--color-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {mode === "confirm" ? (
          <>
            <p className="mb-6 font-medium" style={{ color: "var(--color-ink-muted)" }}>
              {message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { cancelCb?.(); close(); }}
                className="btn-press px-4 py-2 text-sm font-bold"
                style={{
                  border: "var(--border-width) solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--color-ink)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { confirmCb?.(); close(); }}
                className="btn-press px-4 py-2 text-sm font-bold text-white"
                style={{
                  backgroundColor: danger ? "var(--color-danger)" : "var(--color-accent)",
                  border: "var(--border-width) solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
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
              className="w-full px-3 py-2 mb-4 text-sm font-medium outline-none"
              style={{
                backgroundColor: "var(--color-paper)",
                border: "var(--border-width) solid var(--color-border)",
                color: "var(--color-ink)",
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={close}
                className="btn-press px-4 py-2 text-sm font-bold"
                style={{
                  border: "var(--border-width) solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--color-ink)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { if (value.trim()) { cb?.(value.trim()); close(); } }}
                className="btn-press px-4 py-2 text-sm font-bold text-white"
                style={{
                  backgroundColor: "var(--color-accent)",
                  border: "var(--border-width) solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
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
