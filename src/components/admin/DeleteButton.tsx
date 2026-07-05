"use client";

export function DeleteButton({ label = "Delete", confirmText = "Are you sure?" }: { label?: string; confirmText?: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="text-xs font-medium text-rose-600 hover:text-rose-700"
    >
      {label}
    </button>
  );
}
