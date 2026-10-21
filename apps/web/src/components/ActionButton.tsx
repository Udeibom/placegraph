'use client';

export function ActionButton({
  children,
  onClick,
  loading,
  disabled
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-accent px-5 py-2 text-sm text-paper disabled:opacity-50"
    >
      {loading ? 'Working…' : children}
    </button>
  );
}
