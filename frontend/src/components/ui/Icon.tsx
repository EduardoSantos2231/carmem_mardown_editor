import { type SVGProps } from "react";

type IconName =
  | "panel-left"
  | "file-plus"
  | "folder-plus"
  | "trash-2"
  | "edit-3"
  | "file"
  | "file-text"
  | "folder"
  | "chevron-right"
  | "minus"
  | "plus"
  | "eye"
  | "sun"
  | "moon"
  | "bold"
  | "italic"
  | "heading-1"
  | "link"
  | "list"
  | "code-2"
  | "check-circle"
  | "circle"
  | "loader-circle"
  | "graph";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, string> = {
  "panel-left": "M4 4h6v16H4zM14 4h6v16h-6z",
  "file-plus": "M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18v-6M9 15h6",
  "folder-plus": "M2 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM12 18v-6M9 15h6",
  "trash-2": "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6",
  "edit-3": "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  "file": "M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
  "file-text": "M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 13h8M8 17h6M8 9h2",
  "folder": "M2 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
  "chevron-right": "M9 18l6-6-6-6",
  "minus": "M5 12h14",
  "plus": "M12 5v14M5 12h14",
  "eye": "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z",
  "sun": "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 1 1 8 0z",
  "moon": "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  "bold": "M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z",
  "italic": "M19 4h-9M14 20H5M15 4 9 20",
  "heading-1": "M4 12h8M4 20V4M12 20V4M18 16l3 4M21 16l-3 4",
  "link": "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  "list": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "code-2": "M16 18l6-6-6-6M8 6l-6 6 6 6",
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  "circle": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z",
  "loader-circle": "M21 12a9 9 0 1 1-6.219-8.56",
  "graph": "M12 2a2 2 0 0 1 2 2 2 2 0 1 1-2 2M2 10a2 2 0 1 1 2 2M12 18a2 2 0 1 1-2 2M22 10a2 2 0 1 1-2 2M4 12v6M10 6l2 10M14 16l8-6",
};

// ponytail: inline SVGs com traço neobrutalista, substitui Lucide sem dependência extra
export default function Icon({ name, size = 20, className = "", ...props }: IconProps) {
  const d = paths[name];
  const full = name === "check-circle" || name === "circle";
  const spin = name === "loader-circle";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={full ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={`${spin ? "animate-spin" : ""} ${className}`}
      {...props}
    >
      <path d={d} />
    </svg>
  );
}
