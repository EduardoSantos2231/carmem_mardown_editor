export default function Resizer() {
  return (
    <div
      id="sidebar-resizer"
      className="resizer-vertical flex-shrink-0 cursor-col-resize"
      style={{
        width: "4px",
        backgroundColor: "transparent",
        zIndex: 10,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
