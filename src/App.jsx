import React, { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const toFixedNum = (x, n = 6) => Number.parseFloat(Number(x).toFixed(n));
function safeNumber(v, fallback, { min = -Infinity, max = Infinity } = {}) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

function makeCSVExcelFriendly(rows) {
  const header = [
    "tiempo [s]",
    "x1 [m]",
    "v1 [m/s]",
    "x2 [m]",
    "v2 [m/s]",
    "K1 [J]",
    "K2 [J]",
    "Us [J]",
    "Emec [J]",
    "Ediss [J]",
    "p_total [kg·m/s]"
  ];
  const sep = ";";
  const eol = "\r\n";
  const body = rows.map(d =>
    [
      toFixedNum(d.t, 6),
      toFixedNum(d.x1, 6),
      toFixedNum(d.v1, 6),
      toFixedNum(d.x2, 6),
      toFixedNum(d.v2, 6),
      toFixedNum(d.K1, 6),
      toFixedNum(d.K2, 6),
      toFixedNum(d.Us, 6),
      toFixedNum(d.Emec, 6),
      toFixedNum(d.Ediss, 6),
      toFixedNum(d.p, 6)
    ].join(sep)
  );
  const csv = "\uFEFF" + [header.join(sep), ...body].join(eol) + eol;
  return csv;
}

export default function SimuladorEnergiaColisiones1D() {
  const [m1, setM1] = useState(0.5);
  const [m2, setM2] = useState(0.5);
  const [k, setK] = useState(80);
  const [x0, setX0] = useState(0.2);
  const [mu, setMu] = useState(0.05);
  const [e, setE] = useState(0.85);
  const [g, setG] = useState(9.81);
  const [dt, setDt] = useState(0.005);       // paso de integración (físico)
  const [simSpeed, setSimSpeed] = useState(1); // velocidad visual (no afecta la física)

  const L = 9;
  const springLen = 0.3;
  const w1 = 0.4;
  const w2 = 0.4;

  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);

  const [x1, _setX1] = useState(springLen - Math.min(x0, springLen * 0.95));
  const [x2, _setX2] = useState(6.0);
  const [v1, _setV1] = useState(0);
  const [v2, _setV2] = useState(0);
  const [Efric, _setEfric] = useState(0);
  const [Ecol, _setEcol] = useState(0);

  const x1Ref = useRef(x1); const setX1 = (val) => { x1Ref.current = val; _setX1(val); };
  const x2Ref = useRef(x2); const setX2 = (val) => { x2Ref.current = val; _setX2(val); };
  const v1Ref = useRef(v1); const setV1 = (val) => { v1Ref.current = val; _setV1(val); };
  const v2Ref = useRef(v2); const setV2 = (val) => { v2Ref.current = val; _setV2(val); };
  const EfricRef = useRef(Efric); const setEfric = (val) => { EfricRef.current = val; _setEfric(val); };
  const EcolRef = useRef(Ecol); const setEcol = (val) => { EcolRef.current = val; _setEcol(val); };
  const tRef = useRef(t); const tTick = (delta) => { const nv = tRef.current + delta; tRef.current = nv; setT(nv); };

  const lastChartUpdateRef = useRef(0);
  const quietFramesRef = useRef(0);

  const [series, setSeries] = useState([]);
  const seriesRef = useRef([]);

  const canvasRef = useRef(null);
  const pxPorMetro = 120;

  const reset = () => {
    setRunning(false);
    setT(0); tRef.current = 0;
    setX1(springLen - Math.min(x0, springLen * 0.95));
    setX2(6.0);
    setV1(0);
    setV2(0);
    setEfric(0);
    setEcol(0);
    setSeries([]); seriesRef.current = [];
    quietFramesRef.current = 0;
  };

  useEffect(() => { if (!running) setX1(springLen - Math.min(x0, springLen * 0.95)); }, [x0, running]);

  const energies = useMemo(() => {
    const K1 = 0.5 * m1 * v1 * v1;
    const K2 = 0.5 * m2 * v2 * v2;
    const inSpring = x1 < springLen;
    const Us = inSpring ? 0.5 * k * (springLen - x1) * (springLen - x1) : 0;
    const Emec = K1 + K2 + Us;
    const Etot = Emec + Efric + Ecol;
    return { K1, K2, Us, Emec, Etot };
  }, [m1, m2, v1, v2, x1, k, springLen, Efric, Ecol]);

  // --------- BUCLE CON PASO DE FÍSICA FIJO; simSpeed SOLO afecta ritmo visual ----------
  useEffect(() => {
    let raf = null;
    let last = performance.now();
    let accumulator = 0; // acumula tiempo *visual*
    const h = clamp(dt, 0.001, 0.02); // paso físico fijo

    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener("visibilitychange", onVisibility);

    function physicsStep(hh) {
      let _x1 = x1Ref.current;
      let _x2 = x2Ref.current;
      let _v1 = v1Ref.current;
      let _v2 = v2Ref.current;
      let _Efr = EfricRef.current;
      let _Ecol = EcolRef.current;

      const M1 = clamp(m1, 0.05, 50);
      const M2 = clamp(m2, 0.05, 50);
      const K = clamp(k, 0, 1e4);
      const MU = clamp(mu, 0, 1);
      const E_ = clamp(e, 0, 1);
      const G = clamp(g, 0, 30);

      let F1 = 0;
      if (_x1 < springLen) {
        const comp = springLen - _x1;
        F1 += K * comp;
      }
      if (Math.abs(_v1) > 1e-6) {
        const Ffr1 = -MU * M1 * G * Math.sign(_v1);
        F1 += Ffr1;
        _Efr += Math.abs(Ffr1 * _v1 * hh);
      } else {
        const Fspring = _x1 < springLen ? K * (springLen - _x1) : 0;
        if (Math.abs(Fspring) <= MU * M1 * G) {
          F1 = 0; _v1 = 0;
        }
      }

      let F2 = 0;
      if (Math.abs(_v2) > 1e-6) {
        const Ffr2 = -MU * M2 * G * Math.sign(_v2);
        F2 += Ffr2;
        _Efr += Math.abs(Ffr2 * _v2 * hh);
      }

      _v1 += (F1 / M1) * hh; _x1 += _v1 * hh;
      _v2 += (F2 / M2) * hh; _x2 += _v2 * hh;

      if (_x1 < 0) { _x1 = 0; _v1 = Math.abs(_v1) * E_; }
      if (_x2 + w2 > L) { _x2 = L - w2; _v2 = -Math.abs(_v2) * E_; }

      const approaching = (_x1 + w1 <= _x2) ? (_v1 > _v2) : true;
      if (_x1 + w1 > _x2 && approaching) {
        const overlap = _x1 + w1 - _x2;
        const push = overlap / 2;
        _x1 -= push; _x2 += push;

        const preK = 0.5 * M1 * _v1 * _v1 + 0.5 * M2 * _v2 * _v2;
        const v1i = _v1; const v2i = _v2; const vRel = v1i - v2i;
        const v1f = (M1 * v1i + M2 * v2i - M2 * E_ * vRel) / (M1 + M2);
        const v2f = (M1 * v1i + M2 * v2i + M1 * E_ * vRel) / (M1 + M2);
        _v1 = v1f; _v2 = v2f;

        const postK = 0.5 * M1 * _v1 * _v1 + 0.5 * M2 * _v2 * _v2;
        const dK = preK - postK; if (dK > 0) _Ecol += dK;
      }

      if (_x1 < 0.02) _x1 = 0.02;

      const inSpringNow = _x1 < springLen;
      const lowK = (0.5 * M1 * _v1 * _v1 + 0.5 * M2 * _v2 * _v2) < 1e-4;
      const separated = _x1 + w1 <= _x2 + 1e-6;
      if (lowK && !inSpringNow && separated) {
        quietFramesRef.current += 1;
      } else {
        quietFramesRef.current = 0;
      }
      if (quietFramesRef.current >= 60) {
        setRunning(false);
      }

      setX1(_x1); setX2(_x2); setV1(_v1); setV2(_v2); setEfric(_Efr); setEcol(_Ecol); tTick(hh);

      const K1 = 0.5 * M1 * _v1 * _v1;
      const K2 = 0.5 * M2 * _v2 * _v2;
      const Us = _x1 < springLen ? 0.5 * K * (springLen - _x1) * (springLen - _x1) : 0;
      const Emec = K1 + K2 + Us;
      const Ediss = _Efr + _Ecol;
      const pTot = M1 * _v1 + M2 * _v2;

      const point = {
        t: toFixedNum(tRef.current, 4),
        x1: _x1,
        v1: _v1,
        x2: _x2,
        v2: _v2,
        K1, K2, Us, Emec, Ediss,
        p: pTot
      };
      const buf = seriesRef.current;
      if (buf.length > 4000) buf.splice(0, buf.length - 4000);
      buf.push(point);
    }

    function step(now) {
      const frameDt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // simSpeed SOLO acelera el *avance visual* (acumulador), no el paso físico h
      accumulator += frameDt * clamp(simSpeed, 0.25, 4);

      // integra física con paso fijo h
      let safety = 0;
      while (accumulator >= h && safety < 2000) {
        physicsStep(h);
        accumulator -= h;
        safety++;
      }

      // refresco de series ~20 fps
      if (now - lastChartUpdateRef.current > 50) {
        lastChartUpdateRef.current = now;
        setSeries(seriesRef.current.slice(-2000));
      }

      if (running) raf = requestAnimationFrame(step);
    }

    if (running) raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVisibility); };
  }, [running, dt, m1, m2, k, mu, g, e, simSpeed]);
  // ------------------------------------------------------------------------------------

  // Dibujo del canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width; const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    const trackY = H * 0.62;
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, trackY); ctx.lineTo(W - 30, trackY); ctx.stroke();

    const toX = (xm) => 30 + xm * pxPorMetro;

    const springX0 = toX(0); const springX1 = toX(springLen);
    const coils = 13; const amp = 12; const lenPx = springX1 - springX0;
    ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(springX0, trackY);
    for (let i = 0; i <= coils; i++) {
      const x = springX0 + (lenPx * i) / coils;
      const y = trackY + (i % 2 === 0 ? -amp : amp);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(springX1, trackY); ctx.stroke();

    const carHeight = 52;
    const capsule = (x, y, w, h, color) => {
      const r = h / 2;
      ctx.fillStyle = color; ctx.beginPath();
      ctx.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.lineTo(x + w - r, y);
      ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath(); ctx.fill();
    };

    const drawCar = (xm, widthM, color) => {
      const x = toX(xm); const w = widthM * pxPorMetro; const y = trackY - carHeight;
      capsule(x, y, w, carHeight, color);
      ctx.fillStyle = "#111827"; ctx.beginPath();
      ctx.arc(x + w * 0.28, trackY + 12, 9, 0, Math.PI * 2);
      ctx.arc(x + w * 0.72, trackY + 12, 9, 0, Math.PI * 2); ctx.fill();
    };

    drawCar(x1, w1, "#2563eb");
    drawCar(x2, w2, "#f97316");

    const arrow = (xm, v, m, color) => {
      const scale = 12; const px = toX(xm + (m === m1 ? w1 : 0)); const py = trackY - carHeight - 22;
      const len = clamp(v * m * scale, -220, 220);
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + len, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px + len, py);
      ctx.lineTo(px + len - Math.sign(len || 1) * 8, py - 5);
      ctx.lineTo(px + len - Math.sign(len || 1) * 8, py + 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#111827"; ctx.font = "12px ui-sans-serif";
      ctx.fillText(`|p|=${(Math.abs(m * v)).toFixed(2)} kg·m/s`, px + len + (len >= 0 ? 6 : -110), py - 6);
    };

    arrow(x1 + w1 * 0.5, v1, m1, "#2563eb");
    arrow(x2 + w2 * 0.5, v2, m2, "#f97316");

    // Panel grande de información
    const panelX = 24;
    const panelY = 20;
    const panelW = 360;
    const panelH = 140;
    const r = 14;

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(panelX + r, panelY);
    ctx.lineTo(panelX + panelW - r, panelY);
    ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + r);
    ctx.lineTo(panelX + panelW, panelY + panelH - r);
    ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - r, panelY + panelH);
    ctx.lineTo(panelX + r, panelY + panelH);
    ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - r);
    ctx.lineTo(panelX, panelY + r);
    ctx.quadraticCurveTo(panelX, panelY, panelX + r, panelY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a"; ctx.font = "600 16px ui-sans-serif, system-ui";
    ctx.fillText(`t = ${t.toFixed(2)} s`, panelX + 14, panelY + 26);

    ctx.font = "14px ui-sans-serif, system-ui";
    ctx.fillText(`Energía mecánica = ${energies.Emec.toFixed(3)} J`, panelX + 14, panelY + 48);
    ctx.fillText(`E. potencial elástica (Us) = ${energies.Us.toFixed(3)} J`, panelX + 14, panelY + 68);
    ctx.fillText(`E. cinética = ${(energies.K1 + energies.K2).toFixed(3)} J`, panelX + 14, panelY + 88);
    ctx.fillText(`E. disipada = ${(Efric + Ecol).toFixed(3)} J`, panelX + 14, panelY + 108);
    ctx.fillText(`E. total ≈ ${ (energies.Emec + Efric + Ecol).toFixed(3)} J`, panelX + 14, panelY + 128);
  }, [x1, x2, v1, v2, t, energies, Efric, Ecol, m1]);

  const numberInput = (label, value, setter, step, min, max, hint) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <label style={{ fontSize: 14, color: "#0f172a", width: 240 }}>{label}</label>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => setter(safeNumber(e.target.value, value, { min, max }))}
        style={{ width: 140, padding: "8px 10px", borderRadius: 12, background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
      />
      <span style={{ fontSize: 12, color: "#475569" }}>{hint}</span>
    </div>
  );

  const exportCSV = () => {
    const csv = makeCSVExcelFriendly(seriesRef.current);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "simulador_colisiones_energia.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const [showManual, setShowManual] = useState(false);

  return (
    <div style={{ padding: 16, color: "#0f172a", background: "#f8fafc", minHeight: "100vh", fontFamily: "ui-sans-serif, system-ui" }}>
      <style>{`
        .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 6px 28px rgba(2,8,23,.06)}
        .btn{border:none;border-radius:16px;padding:10px 14px;color:#0f172a;background:#22d3ee;cursor:pointer}
        .btn:disabled{opacity:.6;cursor:not-allowed}
        .btn2{background:#60a5fa}
        .btn3{background:#f87171}
        .btn4{background:#34d399}
        .grid2{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:1000px){.grid2{grid-template-columns:1.2fr .8fr}}
        .h2{font-size:22px;font-weight:700}
        .modal{position:fixed;inset:0;background:rgba(15,23,42,.4);display:flex;align-items:center;justify-content:center;padding:16px}
        .modalContent{max-width:1200px;width:100%;}
        .range{width:180px}
      `}</style>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Simulador 1D: Energía, Colisiones y Cantidad de Movimiento</h1>
        <p style={{ marginTop: 8, color: "#334155" }}>
          Objetivo: visualizar la transferencia de energía potencial elástica (Us) a energía cinética, y analizar colisiones 1D con fricción y coeficiente de restitución. Se espera reconocer cuándo se conserva la energía mecánica y cómo el trabajo de fuerzas no conservativas y las colisiones inelásticas (e&lt;1) producen disipación.
        </p>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn"
            onClick={() => {
              setX1(springLen - Math.min(x0, springLen * 0.95));
              setX2(6.0);
              setV1(0); setV2(0);
              setEfric(0); setEcol(0);
              setSeries([]); seriesRef.current = [];
              quietFramesRef.current = 0;
              setT(0); tRef.current = 0;
              setRunning(true);
            }}
          >
            Iniciar
          </button>
          <button className="btn btn2" onClick={() => setRunning(false)}>Pausar</button>
          <button className="btn btn3" onClick={reset}>Reiniciar</button>
          <button className="btn btn4" onClick={exportCSV}>Exportar datos CSV</button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10 }}>
            <label style={{ fontSize: 14 }}>Velocidad de animación (×)</label>
            <input className="range" type="range" min={0.25} max={4} step={0.25} value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))} />
            <span style={{ width: 40, textAlign: "right" }}>{simSpeed.toFixed(2)}×</span>
          </div>

          <button className="btn" onClick={() => setShowManual(true)}>Manual de uso</button>
        </div>
      </div>

      <div className="grid2">
        <div className="card" style={{ padding: 16 }}>
          <div className="h2" style={{ marginBottom: 8 }}>Parámetros</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {numberInput("Masa carrito 1 (kg)", m1, setM1, 0.05, 0.05, 50, "m1")}
            {numberInput("Masa carrito 2 (kg)", m2, setM2, 0.05, 0.05, 50, "m2")}
            {numberInput("Constante del resorte k (N/m)", k, setK, 1, 0, 10000, "Rigidez")}
            {numberInput("Compresión inicial del resorte x₀ (m)", x0, setX0, 0.005, 0.01, 0.45, "x0")}
            {numberInput("Coeficiente de fricción μ", mu, setMu, 0.005, 0, 1, "0–1")}
            {numberInput("Coeficiente de restitución e", e, setE, 0.01, 0, 1, "0 inelástica, 1 elástica")}
            {numberInput("Paso de integración Δt (s)", dt, setDt, 0.001, 0.001, 0.02, "Estabilidad")}
            {numberInput("Gravedad g (m/s²)", g, setG, 0.1, 0, 30, "Fricción")}
          </div>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <canvas ref={canvasRef} width={1440} height={520} style={{ marginTop: 12, borderRadius: 22, border: "1px solid #e2e8f0", width: "100%" }} />
          </div>
        </div>

        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div className="h2" style={{ marginBottom: 8 }}>Energías vs tiempo</div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={series} margin={{ top: 10, left: 8, right: 20, bottom: 10 }}>
                <XAxis dataKey="t" tick={{ fontSize: 12 }} label={{ value: "t (s)", position: "insideBottom", offset: -2 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Energía (J)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? toFixedNum(v, 3) : v)} />
                <Legend />
                <Line type="monotone" dot={false} dataKey="Us" name="Energía potencial elástica (Us)" strokeWidth={2} stroke="#16a34a" />
                <Line type="monotone" dot={false} dataKey="K1" name="Energía cinética carrito 1" strokeWidth={2} stroke="#1d4ed8" />
                <Line type="monotone" dot={false} dataKey="K2" name="Energía cinética carrito 2" strokeWidth={2} stroke="#3b82f6" />
                <Line type="monotone" dot={false} dataKey="Emec" name="Energía mecánica" strokeWidth={2} stroke="#7c3aed" />
                <Line type="monotone" dot={false} dataKey="Ediss" name="Energía disipada (fricción + colisión)" strokeWidth={2} stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="h2" style={{ marginBottom: 8 }}>Velocidades vs tiempo</div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={series} margin={{ top: 10, left: 8, right: 20, bottom: 10 }}>
                <XAxis dataKey="t" tick={{ fontSize: 12 }} label={{ value: "t (s)", position: "insideBottom", offset: -2 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Velocidad (m/s)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? toFixedNum(v, 3) : v)} />
                <Legend />
                <Line type="monotone" dot={false} dataKey="v1" name="Velocidad carrito 1" strokeWidth={2} stroke="#2563eb" />
                <Line type="monotone" dot={false} dataKey="v2" name="Velocidad carrito 2" strokeWidth={2} stroke="#f97316" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showManual && (
        <div className="modal" onClick={() => setShowManual(false)}>
          <div className="modalContent card" onClick={(e) => e.stopPropagation()} style={{ padding: 18 }}>
            <div className="h2" style={{ marginBottom: 8 }}>Manual de uso</div>
            <ol style={{ lineHeight: 1.7, color: "#334155" }}>
              <li>Ajusta masas, constante del resorte y compresión inicial.</li>
              <li>Define fricción μ y restitución e. Con μ=0 y e=1 observarás conservación aproximada de la energía mecánica.</li>
              <li>La «Velocidad de animación (×)» solo afecta lo rápido que ves la animación; los resultados físicos no cambian.</li>
              <li>Presiona «Iniciar». Observa el intercambio entre Us y K, el choque y la evolución de velocidades.</li>
              <li>Usa «Exportar datos CSV» para obtener columnas con tiempo, posiciones, velocidades, energías y p_total.</li>
              <li>Con «Reiniciar» regresas a las condiciones iniciales.</li>
            </ol>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => setShowManual(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
