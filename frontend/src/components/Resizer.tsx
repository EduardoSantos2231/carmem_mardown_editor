export default function Resizer() {
  return (
    <div
      id="sidebar-resizer"
      className="resizer-vertical flex-shrink-0 cursor-col-resize"
      style={{
        width: "var(--border-width)",
        backgroundColor: "var(--color-border)",
        zIndex: 10,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
