export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className="absolute inset-0 border-4 rounded-full animate-spin"
          style={{
            borderColor: "var(--accent)",
            borderTopColor: "transparent"
          }}
        />
      </div>
      <p style={{ color: "var(--muted)" }} className="text-sm font-medium">
        Loading recipes...
      </p>
    </div>
  );
}