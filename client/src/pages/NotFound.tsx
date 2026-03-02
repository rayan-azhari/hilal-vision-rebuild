import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "var(--space)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-8 text-center"
        style={{
          background: "var(--card)",
          border: "1px solid color-mix(in oklch, var(--gold) 15%, transparent)",
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklch, var(--destructive) 10%, transparent)" }}
          >
            <AlertCircle className="h-10 w-10" style={{ color: "var(--destructive)" }} />
          </div>
        </div>

        <h1
          className="text-5xl font-bold mb-2"
          style={{ color: "var(--gold)", fontFamily: "Cinzel, serif" }}
        >
          404
        </h1>

        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          {t("notFound.heading")}
        </h2>

        <p className="mb-8 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {t("notFound.message")}
          <br />
          {t("notFound.detail")}
        </p>

        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all"
          style={{
            background: "linear-gradient(135deg, var(--gold-glow), var(--gold-dim))",
            color: "var(--space)",
          }}
        >
          <Home className="w-4 h-4" />
          {t("notFound.goHome")}
        </button>
      </div>
    </div>
  );
}
