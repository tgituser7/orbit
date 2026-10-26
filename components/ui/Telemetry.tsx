"use client";

import { useEffect, useState } from "react";

type Reading = { label: string; value: string; unit: string; trend?: "up" | "down" };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Illustrative demo figures that drift gently so the panel feels live.
function sample(t: number): Reading[] {
  const value = 248391 + Math.sin(t * 0.35) * 640 + Math.sin(t * 1.3) * 120;
  const today = 1.24 + Math.sin(t * 0.35) * 0.26;
  return [
    { label: "Portfolio value", value: usd.format(value), unit: "" },
    { label: "Today", value: `${today >= 0 ? "+" : ""}${today.toFixed(2)}`, unit: "%", trend: today >= 0 ? "up" : "down" },
    { label: "1Y return", value: "+18.42", unit: "%", trend: "up" },
    { label: "Stocks · Bonds · Cash", value: "70 · 25 · 5", unit: "%" },
  ];
}

export default function Telemetry() {
  const [readings, setReadings] = useState<Reading[]>(() => sample(0));

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setReadings(sample((performance.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <dl className="telemetry">
        {readings.map((r) => (
          <div key={r.label} className="telemetry__row">
            <dt>{r.label}</dt>
            <dd className={r.trend ? `is-${r.trend}` : undefined}>
              {r.value}
              {r.unit && <span>{r.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="telemetry__note">Illustrative example, not a forecast.</p>
    </>
  );
}
