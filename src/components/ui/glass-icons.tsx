import React from "react";

// Interfaces
export interface GlassIconsItem {
  icon: React.ReactElement;
  color: string;
  label: string;
  customClass?: string;
  onClick?: () => void;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
}

// Brand-aligned gradient mapping — calm, premium, desaturated
const gradientMapping: Record<string, string> = {
  blue: "linear-gradient(135deg, #49B7E3, #3A9BC7)",
  purple: "linear-gradient(135deg, #7C6CF2, #6B5CE0)",
  indigo: "linear-gradient(135deg, #6366F1, #5558D9)",
  orange: "linear-gradient(135deg, #F4BE9D, #E8A889)",
  green: "linear-gradient(135deg, #49D69E, #3BC088)",
  teal: "linear-gradient(135deg, #49B7E3, #42A5CC)",
  rose: "linear-gradient(135deg, #E8A0D6, #D48FC4)",
  mint: "linear-gradient(135deg, #B4E8E5, #9DD9D5)",
};

// Component definition
export const Component = ({ items, className }: GlassIconsProps): JSX.Element => {
  const getBackgroundStyle = (color: string): React.CSSProperties => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div
      className={`grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em] overflow-visible ${
        className || ""
      }`}
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className={`relative bg-transparent outline-none w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${
            item.customClass || ""
          }`}
        >
          {/* Back layer */}
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[var(--vektrus-radius-lg)] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[12deg] group-hover:[transform:rotate(18deg)_translate3d(-0.4em,-0.4em,0.4em)]"
            style={{
              ...getBackgroundStyle(item.color),
              boxShadow: "var(--vektrus-shadow-card)",
            }}
          ></span>

          {/* Front layer */}
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[var(--vektrus-radius-lg)] bg-[rgba(255,255,255,0.18)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)] transform group-hover:[transform:translateZ(1.5em)]"
            style={{
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.3) inset",
            }}
          >
            <span
              className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center text-white"
              aria-hidden="true"
            >
              {item.icon}
            </span>
          </span>

          {/* Label */}
          <span className="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-sm opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)] text-[#111111] font-medium">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};
