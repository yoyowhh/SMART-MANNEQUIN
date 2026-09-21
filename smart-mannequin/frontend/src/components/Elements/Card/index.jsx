import React from "react";

const BaseCard = ({
  children,
  height = "h-[400px]",
  mobileHeight = "h-[300px]",
  width = "w-full",
  className = "",
  style = {},
}) => {
  // Normalisasi class height jika di-pass tanpa prefix 'h-'
  const normalizeHeight = (h, prefix = "") => {
    if (!h) return "";
    if (h.startsWith("h-") || h.startsWith("min-h-") || h.startsWith("max-h-")) {
      return prefix ? `${prefix}:${h}` : h;
    }
    const val = `h-[${h}]`;
    return prefix ? `${prefix}:${val}` : val;
  };

  const mobileHClass = normalizeHeight(mobileHeight);
  const desktopHClass = normalizeHeight(height, "sm");

  return (
    <div
      style={style}
      className={`${width} group bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:border-[#00ba88] hover:shadow-[0_12px_30px_rgba(0,186,136,0.14)] transition-all duration-300 ${mobileHClass} ${desktopHClass} ${className}`}>
      {children}
    </div>
  );
};

export default BaseCard;
