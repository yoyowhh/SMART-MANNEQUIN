import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable full-viewport Modal Portal with background blur covering
 * the entire page (including Header, Sidebar, and Footer),
 * locking page background scroll, and allowing only the modal card content to scroll.
 */
export default function LogsModalPortal({
  isOpen,
  onClose,
  maxWidth = "max-w-5xl",
  children,
}) {
  // Lock body scroll when modal is open so the background page stays still
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      style={{ margin: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
