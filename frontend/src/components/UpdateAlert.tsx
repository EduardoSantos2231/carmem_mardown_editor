import { useAppStore } from "@/store/useAppStore";

export default function UpdateAlert() {
  const updateInfo = useAppStore((s) => s.updateInfo);
  if (!updateInfo?.hasUpdate) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}
      onClick={() => useAppStore.getState().setUpdateInfo(null)}
    >
      <div
        className="rounded-xl w-96 p-6 glass-panel animate-scale-in max-h-[80vh] flex flex-col"
        style={{ boxShadow: "0 0 20px rgba(128,131,255,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">Nova versão disponível</h3>
        <p className="mb-1" style={{ color: "var(--color-text-muted)" }}>
          v{updateInfo.latest} &middot; você está na v{updateInfo.current}
        </p>
        {updateInfo.changelog && (
          <div
            className="mb-4 text-sm overflow-y-auto flex-1 max-h-60"
            style={{
              color: "var(--color-text-muted)",
              whiteSpace: "pre-wrap",
            }}
          >
            {updateInfo.changelog}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => useAppStore.getState().setUpdateInfo(null)}
            className="px-4 py-2 rounded-lg text-sm transition-all hover:bg-white/5"
            style={{
              backgroundColor: "transparent",
              border: "var(--border-width) solid var(--color-text-muted)",
              color: "var(--color-text-muted)",
            }}
          >
            Depois
          </button>
          <button
            onClick={() => {
              window.open(updateInfo.downloadUrl, "_blank");
              useAppStore.getState().setUpdateInfo(null);
            }}
            className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
