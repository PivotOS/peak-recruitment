export default function Logo({ className = "" }) {
  return (
    <img
      src="/peaklogo.png"
      alt="Peak Logo"
      className={`mx-auto ${className}`}
      style={{ maxWidth: 200, height: "auto" }}
      loading="lazy"
    />
  );
}