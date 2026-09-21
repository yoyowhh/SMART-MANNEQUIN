import React from "react";
import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="main-footer bg-white border-t border-slate-200/80 text-slate-700 py-10 px-6 sm:px-10 lg:px-12">
      <div className="footer-content max-w-[1700px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Column 1: Brand, Address, and Social Links */}
        <div className="footer-brand flex flex-col gap-4 max-w-xl">
          <div className="footer-brand-header flex items-center gap-3.5">
            <img
              src="/assets/logo.png"
              alt="STAS RG Logo"
              className="footer-logo-img h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/stas-rg/logo_stas.png";
              }}
            />
            <div className="footer-brand-text flex flex-col">
              <h3 className="footer-brand-title text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                STAS RG Smart Mannequin
              </h3>
              <span className="footer-brand-sub text-xs font-semibold text-[#00ba88] tracking-wide">
                Center of Excellence & Research Group
              </span>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/EQHpqHavYCoRyzST9"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-address-link group flex items-start gap-2.5 text-xs text-slate-500 hover:text-[#00ba88] transition-colors leading-relaxed"
            title="Buka di Google Maps">
            <MapPin className="footer-address-icon w-4 h-4 shrink-0 text-[#00ba88] mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="footer-address-text">
              Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257
            </span>
          </a>

          <div className="footer-social-links flex items-center flex-wrap gap-2.5 pt-1">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/stas.rg"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram @stas.rg"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.3" cy="6.8" r="1" fill="currentColor" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:stas-rg@telkomuniversity.ac.id"
              title="Email: stas-rg@telkomuniversity.ac.id"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="Email">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M4 7.5H20V16.5H4V7.5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 8L12 13.5L19 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@stas_rg"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube @stas_rg"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M10 9L15 12L10 15V9Z" fill="currentColor" />
              </svg>
            </a>

            {/* Website */}
            <a
              href="https://www.stas-rg.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Website Resmi: stas-rg.com"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="Website">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3.5 12H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 3C14.8 5.5 16.4 8.6 16.4 12C16.4 15.4 14.8 18.5 12 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 3C9.2 5.5 7.6 8.6 7.6 12C7.6 15.4 9.2 18.5 12 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://id.linkedin.com/company/coe-stas-rg"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn: STAS-RG"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 10V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 8H8.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 16V12.6C12 11.4 12.9 10.5 14.1 10.5C15.3 10.5 16 11.3 16 12.7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 11V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </a>

            {/* Google Maps */}
            <a
              href="https://maps.app.goo.gl/EQHpqHavYCoRyzST9"
              target="_blank"
              rel="noopener noreferrer"
              title="Google Maps Lokasi STAS-RG"
              className="social-icon-btn w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#00ba88] text-slate-600 hover:text-white border border-slate-200/80 hover:border-[#00ba88] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#00ba88]/20"
              aria-label="Google Maps">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 21C16.4 16.7 19 13.6 19 10.1C19 6.7 15.9 4 12 4C8.1 4 5 6.7 5 10.1C5 13.6 7.6 16.7 12 21Z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Info / Copyright */}
        <div className="flex flex-col md:items-end gap-1.5 text-xs text-slate-400">
          <p className="font-medium text-slate-600">
            &copy; {new Date().getFullYear()} STAS RG Smart Mannequin
          </p>
          <p>Anthropometric smart mannequin for passenger comfort & safety.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
