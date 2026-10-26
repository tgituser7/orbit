"use client";

import { useEffect, useState } from "react";

type Reading = { label: string; value: string; unit: string };

function sample(t: number): Reading[] {
  return [
    { label: "Orbital velocity", value: (29.78 + Math.sin(t * 0.7) * 0.42).toFixed(2), unit: "km/s" },
    { label: "Inclination", value: (7.155 + Math.sin(t * 0.31) * 0.08).toFixed(3), unit: "deg" },
    { label: "Eccentricity", value: (0.0167 + Math.sin(t * 0.5) * 0.0011).toFixed(4), unit: "e" },
    { label: "Orbital period", value: (11.42 + Math.sin(t * 0.4) * 0.03).toFixed(2), unit: "s" },
  ];
}

export default function Telemetry() {
  const [readings, setReadings] = useState<Reading[]>(() => sample(0));

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setReadings(sample((performance.now() - start) / 1000)), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <dl className="telemetry">
      {readings.map((r) => (
        <div key={r.label} className="telemetry__row">
          <dt>{r.label}</dt>
          <dd>
            {r.value}
            {r.unit && <span>{r.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
