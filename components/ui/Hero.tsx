"use client";

import dynamic from "next/dynamic";
import Telemetry from "./Telemetry";

const OrbitScene = dynamic(() => import("../scene/OrbitScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Calibrating orbit…</div>,
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
          <a href="#">Systems</a>
          <a href="#">Missions</a>
          <a href="#">Observatory</a>
          <a href="#">Journal</a>
        </nav>
        <a href="#" className="btn btn--ghost nav__cta">
          Launch
        </a>
      </header>

      <div className="hero__content">
        <p className="eyebrow">
          <span className="pulse" /> Live system · real-time orbital mechanics
        </p>
        <h1>
          Everything moves
          <br />
          <em>in orbit.</em>
        </h1>
        <p className="hero__lede">
          A real-time universe of rings, gravity and light. Orbit maps the paths that hold
          everything together — and lets you travel them.
        </p>
        <div className="hero__actions">
          <a href="#" className="btn btn--primary">
            Enter the orbit
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#" className="btn btn--ghost">
            Watch the film
          </a>
        </div>
      </div>

      <aside className="hero__hud">
        <p className="hud__title">
          <span>SYS-01</span> Telemetry
        </p>
        <Telemetry />
      </aside>

      <div className="hero__coords" aria-hidden="true">
        <span>RA 14h 29m 43s</span>
        <span>DEC −62° 40′ 46″</span>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
