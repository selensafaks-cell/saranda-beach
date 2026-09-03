export default function ScallopDivider({ color = "#7A2530" }: { color?: string }) {
  const id = "scallop-" + color.replace("#", "");
  return (
    <svg width="100%" height="9" className="block" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="14" height="9" patternUnits="userSpaceOnUse">
          <path d="M0,0 a7,7 0 0 0 14,0" fill="none" stroke={color} strokeWidth="1.3" opacity="0.55" />
        </pattern>
      </defs>
      <rect width="100%" height="9" fill={`url(#${id})`} />
    </svg>
  );
}
