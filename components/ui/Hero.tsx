"use client";

import dynamic from "next/dynamic";
// import Telemetry from "./Telemetry"; // used by the hidden live portfolio panel

const OrbitScene = dynamic(() => import("../scene/OrbitScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading markets…</div>,
});

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" className="logo__mark">
      <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="currentColor" strokeWidth="1.4" transform="rotate(-24 16 16)" />
      <circle cx="28.2" cy="10.6" r="1.8" fill="currentColor" className="logo__moon" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-label="Orbit">
      <div className="hero__canvas">
        <OrbitScene />
      </div>

      {/* Giant wordmark blended over the scene */}
      <div className="hero__wordmark" aria-hidden="true">
        ORBIT
      </div>

      <header className="nav">
        <a href="#" className="logo">
          <LogoMark />
          <span>ORBIT</span>
        </a>
        <nav className="nav__links">
          <a href="#">Stocks &amp; ETFs</a>
          <a href="#">Retirement</a>
          <a href="#">Wealth Plans</a>
          <a href="#">Research</a>
          <a href="#">Fees</a>
        </nav>
        <a href="#" className="btn btn--ghost nav__cta">
          Open account
        </a>
      </header>

      <div className="hero__content">
        <p className="eyebrow">
          <span className="pulse" /> Markets open · Smart investing, on autopilot
        </p>
        <h1>
          Your money,
          <br />
          <em>always in motion.</em>
        </h1>
        <p className="hero__lede">
          Diversified portfolios built around your goals. Stocks, bonds and ETFs are balanced
          automatically, so your money keeps compounding while you get on with your life.
        </p>
        <div className="hero__actions">
          <a href="#" className="btn btn--primary">
            Start investing
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#" className="btn btn--ghost">
            See how it works
          </a>
        </div>
        <p className="hero__disclaimer">
          Capital at risk. The value of investments can go down as well as up.
        </p>
      </div>

      {/* Live portfolio panel: hidden for now. Uncomment to restore.
      <aside className="hero__hud">
        <p className="hud__title">
          <span>Live</span> Growth portfolio
        </p>
        <Telemetry />
      </aside>
      */}

      <div className="hero__coords" aria-hidden="true">
        <span>S&amp;P 500 ▲ 0.84%</span>
        <span>NASDAQ ▲ 1.12%</span>
        <span>GOLD ▼ 0.21%</span>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
