import { useAppStore } from "@/store/useAppStore";

export default function UpdateAlert() {
  const updateInfo = useAppStore((s) => s.updateInfo);
  if (!updateInfo?.hasUpdate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={() => useAppStore.getState().setUpdateInfo(null)}
    >
      <div
        className="panel w-96 p-6 flex flex-col"
        style={{ boxShadow: "8px 8px 0 var(--color-border)", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2">Nova vers&atilde;o dispon&iacute;vel</h3>
        <p className="mb-1 font-medium" style={{ color: "var(--color-ink-muted)" }}>
          v{updateInfo.latest} &middot; voc&ecirc; est&aacute; na v{updateInfo.current}
        </p>
        {updateInfo.changelog && (
          <div
            className="mb-4 text-sm overflow-y-auto flex-1 max-h-60"
            style={{
              color: "var(--color-ink-muted)",
              whiteSpace: "pre-wrap",
            }}
          >
            {updateInfo.changelog}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => useAppStore.getState().setUpdateInfo(null)}
            className="btn-press px-4 py-2 text-sm font-bold"
            style={{ border: "var(--border-width) solid var(--color-border)", boxShadow: "var(--shadow-sm)", color: "var(--color-ink)" }}
          >
            Depois
          </button>
          <button
            onClick={() => { window.open(updateInfo.downloadUrl, "_blank"); useAppStore.getState().setUpdateInfo(null); }}
            className="btn-press px-4 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: "var(--color-accent)", border: "var(--border-width) solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
