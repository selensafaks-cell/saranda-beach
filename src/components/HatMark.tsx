export default function HatMark({
  size = 34,
  color = "#7A2530",
  bandColor = "#B68235"
}: {
  size?: number;
  color?: string;
  bandColor?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 24) / 40}
      viewBox="0 0 40 24"
      fill="none"
      stroke={color}
      strokeWidth="1.3"
      aria-hidden="true"
    >
      <ellipse cx="20" cy="17.5" rx="17" ry="4.8" />
      <path d="M8.6 16.5C8.6 5.5 12.6 3 20 3s11.4 2.5 11.4 13.5" />
      <path d="M9 14.8c4.2 2 17.8 2 22 0" stroke={bandColor} strokeWidth="2.6" />
    </svg>
  );
}
