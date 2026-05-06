import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** Fixed glass pill — used on Login & Register only. */
export function BackToLanding() {
  return (
    <Link
      to="/"
      aria-label="Back to MedAlert home"
      className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/75 px-3.5 py-2 text-sm font-medium text-gray-800 shadow-[0_8px_30px_-6px_rgba(15,110,86,0.18)] ring-1 ring-white/90 backdrop-blur-xl transition hover:border-[#0f6e56]/25 hover:bg-white hover:text-[#0f6e56] sm:left-6 sm:top-6 sm:px-4"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="hidden sm:inline">Back to website</span>
      <span className="sm:hidden">Home</span>
    </Link>
  );
}
