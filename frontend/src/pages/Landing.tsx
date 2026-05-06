import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Menu,
  Package,
  Pill,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const trustHighlights = [
  {
    label: "JWT secured",
    Icon: ShieldCheck,
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    label: "Push + Email + SMS alerts",
    Icon: Bell,
    accent: "from-emerald-500/15 to-cyan-500/10",
  },
  {
    label: "AI assistant included",
    Icon: Sparkles,
    accent: "from-violet-500/15 to-emerald-500/10",
  },
  {
    label: "Real-time stock tracking",
    Icon: Package,
    accent: "from-teal-500/15 to-emerald-500/10",
  },
] as const;

const trustLeft = trustHighlights.slice(0, 2);
const trustRight = trustHighlights.slice(2, 4);

type TrustItem = (typeof trustHighlights)[number];

function TrustPillarCard({
  item,
  side,
  layout = "flank",
}: {
  item: TrustItem;
  side: "left" | "right";
  layout?: "flank" | "grid";
}) {
  const { label, Icon, accent } = item;
  const position =
    layout === "grid"
      ? "mx-auto w-full max-w-sm"
      : side === "left"
        ? "ml-auto max-w-[260px] sm:max-w-[280px] lg:max-w-[300px]"
        : "mr-auto max-w-[260px] sm:max-w-[280px] lg:max-w-[300px]";
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-white/95 p-3.5 shadow-[0_12px_40px_-12px_rgba(15,110,86,0.2)] backdrop-blur-sm ring-1 ring-white/90 ${position}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-[#0f6e56] shadow-inner ring-1 ring-emerald-500/10`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="min-w-0 flex-1 text-left text-[13px] font-semibold leading-snug text-gray-800">
        <span className="mr-1 text-emerald-600" aria-hidden>
          ✓
        </span>
        {label}
      </p>
    </div>
  );
}

const faqItems = [
  {
    question: "Is MedAlert free to use?",
    answer:
      "Yes — MedAlert is free to sign up and use. All core features including reminders, stock alerts, and the AI assistant are included.",
  },
  {
    question: "Which notification channels are supported?",
    answer:
      "MedAlert supports browser push notifications, email, and SMS. You can enable any combination from your settings page.",
  },
  {
    question: "How does the stock alert work?",
    answer:
      "MedAlert runs a daily background scan of your medicine stock levels. When any medicine drops below a threshold, you receive an alert via your preferred channels.",
  },
  {
    question: "Is my health data secure?",
    answer:
      "All data is protected with JWT authentication and encrypted in transit. Your medicine data is private to your account and never shared.",
  },
  {
    question: "Can I manage medicines for someone else?",
    answer:
      "Yes — caregivers can create an account and manage medicines on behalf of a family member, with full reminder and stock alert support.",
  },
];

const testimonials = [
  {
    stars: "★★★★★",
    quote:
      '"I used to forget my evening dose at least twice a week. Since using MedAlert I have not missed one."',
    initials: "AR",
    avatarClass: "avatar-green",
    name: "Amara R.",
    role: "Managing 4 daily medications",
  },
  {
    stars: "★★★★★",
    quote:
      '"The stock alert saved me — I had no idea my blood pressure medicine was almost out until MedAlert warned me."',
    initials: "DK",
    avatarClass: "avatar-blue",
    name: "David K.",
    role: "Caregiver for elderly parent",
  },
  {
    stars: "★★★★★",
    quote:
      '"The AI assistant answered my question about drug interactions instantly. It felt like having a pharmacist on call."',
    initials: "SP",
    avatarClass: "avatar-amber",
    name: "Sneha P.",
    role: "Chronic illness patient",
  },
  {
    stars: "★★★★☆",
    quote:
      '"SMS reminders are a game changer for my dad who does not use smartphones. Setup took 5 minutes."',
    initials: "MT",
    avatarClass: "avatar-rose",
    name: "Marcus T.",
    role: "Family health manager",
  },
];

const features = [
  {
    title: "Smart reminders",
    description: "Schedule doses at any time. Get nudges if you forget to acknowledge.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Stock alerts",
    description: "Get warned before you run out. Never scramble for a refill again.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <path d="M18 8h1a4 4 0 010 8h-1" />
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    title: "3-channel alerts",
    description: "Push, email, and SMS — choose what works for you.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    title: "Adherence dashboard",
    description: "Track your dose history and adherence trends over time.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "AI assistant",
    description: "Ask questions about your medicines. Get answers instantly.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "Online pharmacy",
    description: "Order refills directly. Track delivery status in one place.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal-id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-reveal-id");
            if (sectionId) {
              setVisibleSections((prev) => ({ ...prev, [sectionId]: true }));
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white text-[#111]">
      <nav className="sticky top-0 z-50 border-b border-emerald-900/[0.07] bg-white/25 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/20">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[#0a5c47] transition hover:opacity-90"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f6e56] shadow-sm ring-1 ring-emerald-900/10">
              <Pill className="h-4 w-4 text-white" />
            </span>
            <span className="text-[16px] tracking-tight">MedAlert</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#features"
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-gray-700/90 transition hover:bg-white/45 hover:text-[#0f6e56]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-gray-700/90 transition hover:bg-white/45 hover:text-[#0f6e56]"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="rounded-full px-3.5 py-2 text-[13px] font-medium text-gray-700/90 transition hover:bg-white/45 hover:text-[#0f6e56]"
            >
              FAQ
            </a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-full border border-emerald-900/10 bg-white/35 px-4 py-2 text-[13px] font-medium text-gray-800 shadow-sm backdrop-blur-sm transition hover:border-emerald-900/15 hover:bg-white/55"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-[#0f6e56] px-4 py-2 text-[13px] font-medium text-white shadow-md shadow-emerald-900/20 ring-1 ring-emerald-900/10 transition hover:bg-[#0c5a47] hover:shadow-lg hover:shadow-emerald-900/25"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-gray-700 transition hover:bg-white/40 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-emerald-900/[0.08] bg-white/70 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-3 px-4 py-4">
              <a
                href="#features"
                className="text-sm text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a href="#faq" className="text-sm text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </a>
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-[#0f6e56] px-4 py-2 text-center text-sm font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-violet-50 px-4 pb-16 pt-14 sm:px-6 sm:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-300 opacity-30 blur-3xl" />

        <div className="mx-auto w-full max-w-6xl text-center">
          <div className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-[#0a5c47]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1d9e75]" />
            Smart medicine management
          </div>
          <h1 className="relative z-10 mt-6 text-3xl font-extrabold tracking-tight text-[#0d1f1a] sm:text-4xl md:text-5xl">
            Never miss a dose.
            <br />
            <span className="text-[#0f6e56]">Stay ahead of your health.</span>
          </h1>
          <p className="relative z-10 mx-auto mt-4 max-w-[460px] text-[15px] leading-7 text-[#556b63]">
            MedAlert reminds you when to take your medicines, alerts you when stock runs low,
            and keeps your entire medication routine on track — automatically.
          </p>
          <div className="relative z-10 mb-10 mt-8 flex flex-wrap justify-center gap-2.5">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0f6e56] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c5a47]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-[10px] border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Log in to your account
            </Link>
          </div>
          <button
            type="button"
            onClick={() => navigate("/login?demo=admin")}
            className="relative z-10 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-emerald-700"
          >
            <ShieldCheck className="h-4 w-4" />
            Try Admin Demo — no signup needed
          </button>

          {/* Mobile: four trust cards (mockup hidden below md) */}
          <div className="relative z-10 mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 px-2 sm:grid-cols-2 md:hidden">
            {trustHighlights.map((item) => (
              <TrustPillarCard key={item.label} item={item} side="left" layout="grid" />
            ))}
          </div>

          {/* md+: JWT + alerts on the left, stock + AI on the right of the dashboard mockup */}
          <div className="relative z-10 mx-auto mt-10 hidden w-full max-w-6xl items-center md:grid md:grid-cols-[minmax(0,1fr)_min(100%,560px)_minmax(0,1fr)] md:gap-5 lg:gap-8 xl:gap-10">
            <div className="flex flex-col justify-center gap-4 lg:gap-5">
              {trustLeft.map((item) => (
                <TrustPillarCard key={item.label} item={item} side="left" />
              ))}
            </div>
            <div className="mx-auto w-full max-w-[560px] md:-rotate-0">
              <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                  <span className="mx-2 block flex-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-left text-[10px] text-gray-500">
                    medalert.app/dashboard
                  </span>
                </div>
                <div className="p-4 text-left">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#0d1f1a]">Good morning!</p>
                    <p className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-[#0a5c47]">
                      3 reminders today
                    </p>
                  </div>
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
                      <p className="text-base font-bold text-[#0f6e56]">6</p>
                      <p className="mt-0.5 text-[9px] text-gray-500">Medicines</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
                      <p className="text-base font-bold text-[#185fa5]">94%</p>
                      <p className="mt-0.5 text-[9px] text-gray-500">Adherence</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
                      <p className="text-base font-bold text-[#ba7517]">2</p>
                      <p className="mt-0.5 text-[9px] text-gray-500">Low stock</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-2">
                      <p className="text-base font-bold text-[#a32d2d]">1</p>
                      <p className="mt-0.5 text-[9px] text-gray-500">Expiring soon</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-2.5 py-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#1d9e75]" />
                      <p className="flex-1 text-[11px] font-semibold text-gray-800">Metformin 500mg</p>
                      <p className="text-[10px] text-gray-500">8:00 AM</p>
                      <p className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-[#0a5c47]">
                        Taken
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-2.5 py-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#ba7517]" />
                      <p className="flex-1 text-[11px] font-semibold text-gray-800">Amlodipine 5mg</p>
                      <p className="text-[10px] text-gray-500">2:00 PM</p>
                      <p className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-[#854f0b]">
                        Pending
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-2.5 py-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#185fa5]" />
                      <p className="flex-1 text-[11px] font-semibold text-gray-800">Atorvastatin 10mg</p>
                      <p className="text-[10px] text-gray-500">9:00 PM</p>
                      <p className="rounded bg-primary-100 px-1.5 py-0.5 text-[9px] font-semibold text-primary-800">
                        Upcoming
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 lg:gap-5">
              {trustRight.map((item) => (
                <TrustPillarCard key={item.label} item={item} side="right" />
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 flex flex-wrap justify-center md:mt-12">
            {[
              { num: "3×", label: "Notification channels" },
              { num: "100%", label: "Automated reminders" },
              { num: "AI", label: "Powered assistant" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`px-7 text-center ${index > 0 ? "border-l border-emerald-100" : ""}`}
              >
                <p className="text-[22px] font-extrabold text-[#0f6e56]">{stat.num}</p>
                <p className="mt-0.5 text-[11px] text-[#6b8880]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        data-reveal-id="features"
        className={`flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 flex-col border-b border-gray-200 px-4 py-8 transition-all duration-700 sm:px-6 sm:py-10 ${
          visibleSections.features ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-8 sm:gap-10">
          <header className="shrink-0 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0f6e56]">Features</div>
            <div className="text-[22px] font-bold text-[#111]">Everything your health routine needs</div>
            <p className="max-w-2xl text-sm leading-6 text-gray-600">
              Built for patients, caregivers, and anyone managing a daily medication schedule.
            </p>
          </header>
          <div className="flex min-h-0 w-full flex-1 flex-col lg:pt-2">
            <div className="grid h-full min-h-0 w-full auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:grid-rows-2 lg:gap-8 lg:place-content-evenly">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex min-h-0 w-full flex-col rounded-[10px] border border-[#e8edf0] bg-[#f8fafb] p-4 sm:p-5"
                >
                  <div className="mb-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e1f5ee]">
                    {feature.svg}
                  </div>
                  <div className="text-[13px] font-semibold text-[#111]">{feature.title}</div>
                  <div className="mt-1 flex-1 text-xs leading-5 text-gray-600">{feature.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        data-reveal-id="how"
        className={`flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 flex-col border-b border-gray-200 px-4 py-8 transition-all duration-700 sm:px-6 sm:py-10 ${
          visibleSections.how ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-8 sm:gap-10">
          <header className="shrink-0 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0f6e56]">How it works</div>
            <div className="text-[22px] font-bold text-[#111]">Up and running in 3 steps</div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col justify-end sm:justify-center lg:max-w-3xl lg:justify-evenly lg:py-2">
            {[
              {
                title: "Add your medicines",
                description:
                  "Enter your medicine names, dosage, schedule times, stock quantity, and expiry date. Our autocomplete makes it fast.",
              },
              {
                title: "Choose your alert channels",
                description:
                  "Enable push notifications, email, or SMS — or all three. MedAlert sends reminders at exactly the right time.",
              },
              {
                title: "Stay on track effortlessly",
                description:
                  "Acknowledge doses, monitor your adherence dashboard, and let MedAlert handle the rest — including stock alerts before you run out.",
              },
            ].map((step, index, arr) => (
              <div key={step.title} className="flex gap-4 py-2 lg:py-3">
                <div className="flex flex-col items-center self-stretch">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f6e56] text-[13px] font-bold text-white">
                    {index + 1}
                  </div>
                  {index < arr.length - 1 && <div className="my-1 w-px flex-1 bg-gray-300" />}
                </div>
                <div className="min-w-0 flex-1 pb-2 pt-1">
                  <div className="text-sm font-semibold text-[#111]">{step.title}</div>
                  <div className="mt-1 text-[13px] leading-6 text-gray-600">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        data-reveal-id="stats"
        className={`bg-[#0f6e56] px-4 py-7 transition-all duration-700 sm:px-6 ${
          visibleSections.stats ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="mt-0.5 text-xs text-emerald-200">Reminder delivery rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">&lt;1s</div>
            <div className="mt-0.5 text-xs text-emerald-200">Average alert latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">3</div>
            <div className="mt-0.5 text-xs text-emerald-200">Notification channels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="mt-0.5 text-xs text-emerald-200">Background job monitoring</div>
          </div>
        </div>
      </div>

      <section
        data-reveal-id="testimonials"
        className={`border-b border-gray-200 px-4 py-10 transition-all duration-700 sm:px-6 ${
          visibleSections.testimonials ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0f6e56]">Testimonials</div>
          <div className="mt-2 text-[22px] font-bold text-[#111]">Trusted by real users</div>
          <div className="mt-2 text-sm leading-6 text-gray-600">
            Here&apos;s what people managing daily medications say about MedAlert.
          </div>
          <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-2">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[10px] border border-[#e8edf0] bg-[#f8fafb] p-4">
                <div className="mb-2 text-xs text-amber-500">{item.stars}</div>
                <div className="text-[13px] italic leading-6 text-gray-700">{item.quote}</div>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`flex h-[30px] w-[30px] items-center justify-center rounded-full text-[11px] font-semibold text-white ${
                      item.avatarClass === "avatar-green"
                        ? "bg-[#0f6e56]"
                        : item.avatarClass === "avatar-blue"
                          ? "bg-[#185fa5]"
                          : item.avatarClass === "avatar-amber"
                            ? "bg-[#854f0b]"
                            : "bg-[#993556]"
                    }`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#111]">{item.name}</div>
                    <div className="text-[11px] text-gray-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        data-reveal-id="faq"
        className={`scroll-mt-14 border-b border-gray-200 px-4 py-10 transition-all duration-700 sm:px-6 ${
          visibleSections.faq ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0f6e56]">FAQ</div>
          <div className="mt-2 text-[22px] font-bold text-[#111]">Common questions</div>
          <div className="mt-4 space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question} className="overflow-hidden rounded-lg border border-[#e8edf0]">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between bg-white px-3.5 py-3 text-left text-[13px] font-medium text-[#111] hover:bg-[#f8fafb]"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    {item.question}
                    <span
                      className={`text-xs text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    >
                      ▶
                    </span>
                  </button>
                  {isOpen && <div className="px-3.5 pb-3 text-[13px] leading-6 text-gray-600">{item.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        data-reveal-id="cta"
        className={`bg-[#f8fafb] px-4 py-12 text-center transition-all duration-700 sm:px-6 ${
          visibleSections.cta ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-2xl font-bold text-[#111]">Ready to take control of your health?</h2>
          <p className="mt-2.5 text-sm text-gray-600">
            Join MedAlert today. Set up your first reminder in under 2 minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link
              to="/register"
              className="rounded-[10px] bg-[#0f6e56] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c5a47]"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="rounded-[10px] border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-500">© 2025 MedAlert. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
              Terms
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
