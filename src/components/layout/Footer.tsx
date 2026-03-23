"use client";

export function Footer() {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 6
      ? "🌙 3am thoughts deserve a safe place"
      : hour < 12
      ? "☀️ Start the day by speaking your truth"
      : hour < 18
      ? "🌤️ Midday reflections"
      : "🌆 Evening feels";

  return (
    <footer className="text-center py-8 text-xs text-white/20" suppressHydrationWarning>
      <p>Made with quiet nights and loud thoughts</p>
      <p className="mt-1" suppressHydrationWarning>{timeGreeting}</p>
    </footer>
  );
}
