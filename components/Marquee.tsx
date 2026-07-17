interface Props {
  items: string[];
  className?: string;
  durationSeconds?: number;
}

export default function Marquee({
  items,
  className = "",
  durationSeconds = 28,
}: Props) {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={`${key}-${item}`} className="flex items-center">
          <span
            className="display whitespace-nowrap px-[3vw]"
            style={{ fontSize: "clamp(2.5rem, 7vw, 7rem)" }}
          >
            {item}
          </span>
          <span aria-hidden className="text-[1.5vw] opacity-40">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="marquee-track"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
