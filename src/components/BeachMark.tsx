// The site's one deliberate illustration moment - loose, hand-drawn linework,
// used only here (order confirmation) per the "spend your boldness in one
// place" principle. Sage appears only as this illustration's accent stroke.
export default function BeachMark({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 100) / 140} viewBox="0 0 140 100" fill="none" aria-hidden="true">
      {/* umbrella canopy */}
      <path
        d="M20 46 Q30 18 70 16 Q110 18 120 46 Q107 40 95 46 Q83 39 70 46 Q57 39 45 46 Q33 40 20 46 Z"
        stroke="#201F1D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M70 16 L70 8" stroke="#201F1D" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M70 46 L66 84" stroke="#201F1D" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M50 84 Q66 92 84 84" stroke="#201F1D" strokeWidth="1.6" strokeLinecap="round" />

      {/* drink glass */}
      <path d="M100 58 L105 82 Q112 86 119 82 L124 58 Z" stroke="#B68235" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M100 58 L124 58" stroke="#B68235" strokeWidth="1.6" />
      <path d="M116 55 Q120 46 128 45" stroke="#B68235" strokeWidth="1.4" strokeLinecap="round" />
      {/* sage garnish leaf - the illustration's one sage accent */}
      <path d="M104 55 Q100 46 92 45 Q99 52 104 55 Z" stroke="#8CA37E" strokeWidth="1.4" strokeLinejoin="round" />

      {/* shoreline */}
      <path
        d="M6 92 Q23 87 40 92 T74 92 T108 92 T134 92"
        stroke="#201F1D"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
