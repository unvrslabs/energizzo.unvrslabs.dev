export function AnimatedBackground({
  variant = "vivid",
}: {
  variant?: "vivid" | "calm";
}) {
  const stageClass =
    variant === "calm" ? "aurora-stage aurora-stage--calm" : "aurora-stage";
  return (
    <div className={stageClass} aria-hidden>
      <div className="aurora-blob aurora-blob--a" />
      <div className="aurora-blob aurora-blob--b" />
      <div className="aurora-blob aurora-blob--c" />
      <div className="aurora-blob aurora-blob--d" />
      <div className="aurora-grid" />
      <div className="aurora-vignette" />
    </div>
  );
}
