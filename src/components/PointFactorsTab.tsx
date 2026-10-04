import React, { useState, useMemo } from 'react';
import { Download, Compass, Copy, Check } from 'lucide-react';
import { calculatePointFactors, dmsToDecimal, UNSA_PRESETS } from '../utils/geodesyMath';
import { DMSCoordinate } from '../types/geodesy';
import { MathView } from './MathView';
import { exportPointFactorsPdf } from '../utils/pdfExport';

export const PointFactorsTab: React.FC = () => {
  // Datos por defecto: Grupo 3 - Punto A7
  const [pointName, setPointName] = useState('Punto A7 (Grupo 3)');
  const [datumKey, setDatumKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');

  // Latitude DMS (13° 22' 25.95" S)
  const [latDeg, setLatDeg] = useState(13);
  const [latMin, setLatMin] = useState(22);
  const [latSec, setLatSec] = useState(25.95);
  const [latDir, setLatDir] = useState<'N' | 'S'>('S');

  // UTM East, North and h
  const [east, setEast] = useState<number>(614294.617);
  const [north, setNorth] = useState<number>(8521274.715);
  const [h, setH] = useState<number>(3650.305);

  const [copied, setCopied] = useState(false);

  // Load Presets
  const loadPreset = (presetKey: keyof typeof UNSA_PRESETS) => {
    const p = UNSA_PRESETS[presetKey];
    setPointName(p.name);
    setLatDeg(p.latDms.degrees);
    setLatMin(p.latDms.minutes);
    setLatSec(p.latDms.seconds);
    setLatDir(p.latDms.direction as 'N' | 'S');
    setEast(p.east ?? 614294.617);
    setNorth(p.north ?? 8521274.715);
    if (p.h !== undefined) setH(p.h);
  };

  const pointFactors = useMemo(() => {
    const latDms: DMSCoordinate = {
      degrees: Number(latDeg) || 0,
      minutes: Number(latMin) || 0,
      seconds: Number(latSec) || 0,
      direction: latDir,
    };
    const latDecimal = dmsToDecimal(latDms);
    return calculatePointFactors(
      pointName,
      datumKey,
      latDecimal,
      Number(east) || 500000,
      Number(north) || 8000000,
      Number(h) || 0
    );
  }, [pointName, datumKey, latDeg, latMin, latSec, latDir, east, north, h]);

  const handleCopy = () => {
    const text = `Factores Geodésicos (${pointName}):
Kescala: ${pointFactors.kScale.toFixed(10)}
Kelevación: ${pointFactors.kElevation.toFixed(10)}
Kcombinado: ${pointFactors.kCombined.toFixed(10)}
R (medio): ${pointFactors.R.toFixed(3)} m
N (normal): ${pointFactors.N.toFixed(3)} m`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Presets */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              Cálculo de Factores Geodésicos de un Punto
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Factor de Escala (Kescala), Factor de Elevación (Kelevación) y Factor Combinado (Kcombinado).
            </p>
          </div>

          {/* Preset Buttons matching PDF 1 and 2 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Puntos del PDF:</span>
            <button
              onClick={() => loadPreset('A8')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Punto A8
            </button>
            <button
              onClick={() => loadPreset('P8')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Punto P8
            </button>
            <button
              onClick={() => loadPreset('A7')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Punto A7
            </button>
            <button
              onClick={() => loadPreset('P7')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              Punto P7
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Inputs & Official Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2.5">
              Datos del Punto
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nombre del Punto
                </label>
                <input
                  type="text"
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  placeholder="ej. Punto A8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Datum
                </label>
                <select
                  value={datumKey}
                  onChange={(e) => setDatumKey(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="WGS84">WGS 84</option>
                  <option value="HAYFORD">Hayford (PSAD56)</option>
                </select>
              </div>
            </div>

            {/* Latitude Inputs */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Latitud Geodésica (φ)
                </label>
                <span className="text-[11px] font-mono text-cyan-400">
                  {pointFactors.latDecimal.toFixed(8)}°
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <input
                    type="number"
                    value={latDeg}
                    onChange={(e) => setLatDeg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Grados"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Grados (°)</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={latMin}
                    onChange={(e) => setLatMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Min"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Min (′)</span>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.0001"
                    value={latSec}
                    onChange={(e) => setLatSec(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Seg"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Seg (″)</span>
                </div>
                <div>
                  <select
                    value={latDir}
                    onChange={(e) => setLatDir(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                  >
                    <option value="S">S (Sur)</option>
                    <option value="N">N (Norte)</option>
                  </select>
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Hemisf.</span>
                </div>
              </div>
            </div>

            {/* Coordinates and Elevation */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Coordenada Este UTM (m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={east}
                  onChange={(e) => setEast(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                  placeholder="ej. 613495.358"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Coordenada Norte UTM (m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={north}
                  onChange={(e) => setNorth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                  placeholder="ej. 8520781.602"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Altura Elipsoidal h (m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                  placeholder="ej. 3848.100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => exportPointFactorsPdf(pointFactors)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Descargar Cuadro de Factores en PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results Cards & Official UNSA Slide Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Factor de Escala (Kescala)
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {pointFactors.kScale.toFixed(10)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {pointFactors.kScale > 1 ? 'K > 1 (Amplía)' : 'K < 1 (Reduce)'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Factor Elevación (Kelev)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {pointFactors.kElevation.toFixed(10)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                R / (R + h)
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Factor Combinado (Kcomb)
              </span>
              <div className="text-xl font-bold font-mono text-purple-300">
                {pointFactors.kCombined.toFixed(10)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Kelev · Kescala
              </span>
            </div>
          </div>

          {/* Official Format Table from PDF UNSA (Pages 1 & 2) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Cuadro Oficial de Factores ({pointName})
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="overflow-x-auto text-[11px] font-mono border border-slate-800 rounded-lg">
              <table className="w-full border-collapse text-center">
                <tbody>
                  {/* Row 1 Headers */}
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">N</td>
                    <td className="p-2 border-r border-slate-800">2 * N² * Ko²</td>
                    <td className="p-2 border-r border-slate-800">e'²</td>
                    <td className="p-2 border-r border-slate-800">1 + e'² * cos²φ</td>
                    <td className="p-2">P</td>
                  </tr>
                  {/* Row 1 Values */}
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800 font-semibold text-cyan-300">
                      {pointFactors.N.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800">
                      {pointFactors.twoN2K02.toExponential(9).toUpperCase()}
                    </td>
                    <td className="p-2 border-r border-slate-800">{pointFactors.ePrime2.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{pointFactors.onePlusEprime2Cos2Phi.toFixed(10)}</td>
                    <td className="p-2 font-semibold text-purple-300">{pointFactors.P.toFixed(11)}</td>
                  </tr>

                  {/* Row 2 Headers */}
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">X</td>
                    <td className="p-2 border-r border-slate-800">q</td>
                    <td className="p-2 border-r border-slate-800">P * q²</td>
                    <td className="p-2 border-r border-slate-800">0.00003 * q⁴</td>
                    <td className="p-2 font-bold text-white bg-red-950/40">Kescala</td>
                  </tr>
                  {/* Row 2 Values */}
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800">
                      {pointFactors.X.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800">{pointFactors.q.toFixed(10)}</td>
                    <td className="p-2 border-r border-slate-800">{pointFactors.Pq2.toFixed(10)}</td>
                    <td className="p-2 border-r border-slate-800">{pointFactors.q4Term.toExponential(8).toUpperCase()}</td>
                    <td className="p-2 font-bold text-cyan-400 bg-red-950/40">
                      {pointFactors.kScale.toFixed(10)}
                    </td>
                  </tr>

                  {/* Row 3 Headers */}
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800 font-medium">
                    <td colSpan={2} className="p-2 border-r border-slate-800">Kelevación</td>
                    <td colSpan={3} className="p-2 font-bold text-white bg-red-950/40">Kcombinado</td>
                  </tr>
                  {/* Row 3 Values */}
                  <tr className="bg-slate-950/60 text-slate-200 font-semibold">
                    <td colSpan={2} className="p-2 border-r border-slate-800 text-emerald-400">
                      {pointFactors.kElevation.toFixed(10)}
                    </td>
                    <td colSpan={3} className="p-2 text-purple-300 bg-red-950/40 font-bold">
                      {pointFactors.kCombined.toFixed(10)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Radii Summary Box */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Gran Normal (N)</span>
                <span className="text-slate-200 font-semibold">{pointFactors.N.toLocaleString('en-US', { minimumFractionDigits: 3 })} m</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Radio Meridiano (ρ)</span>
                <span className="text-slate-200 font-semibold">{pointFactors.rho.toLocaleString('en-US', { minimumFractionDigits: 3 })} m</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Radio Medio (R = √ρN)</span>
                <span className="text-cyan-300 font-semibold">{pointFactors.R.toLocaleString('en-US', { minimumFractionDigits: 3 })} m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LaTeX Equations & Development */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Desarrollo Matemático con Reemplazo de Valores
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-red-400 font-mono block">
              1. Cálculo del Factor de Escala (Kescala)
            </span>
            <MathView
              block
              math={`X = |500\\,000 - ${pointFactors.east.toFixed(3)}| = ${pointFactors.X.toFixed(3)}\\text{ m}`}
            />
            <MathView
              block
              math={`q = 10^{-6} \\cdot X = ${pointFactors.q.toFixed(10)}`}
            />
            <MathView
              block
              math={`P = \\left[ \\frac{1 + ${pointFactors.ePrime2.toFixed(7)} \\cos^2(${pointFactors.latDecimal.toFixed(4)}^\\circ)}{2 \\cdot (${pointFactors.N.toFixed(3)})^2 \\cdot (0.9996)^2} \\right] \\cdot 10^{12} = ${pointFactors.P.toFixed(11)}`}
            />
            <MathView
              block
              math={`K_\\text{escala} = 0.9996 \\cdot \\left[ 1 + ${pointFactors.Pq2.toFixed(10)} + ${pointFactors.q4Term.toExponential(4)} \\right] = ${pointFactors.kScale.toFixed(10)}`}
            />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-red-400 font-mono block">
              2. Factor de Elevación y Factor Combinado
            </span>
            <MathView
              block
              math={`R = \\sqrt{\\rho \\cdot N} = \\sqrt{${pointFactors.rho.toFixed(2)} \\cdot ${pointFactors.N.toFixed(2)}} = ${pointFactors.R.toFixed(3)}\\text{ m}`}
            />
            <MathView
              block
              math={`K_\\text{elevación} = \\frac{R}{R + h} = \\frac{${pointFactors.R.toFixed(3)}}{${pointFactors.R.toFixed(3)} + ${pointFactors.h.toFixed(3)}} = ${pointFactors.kElevation.toFixed(10)}`}
            />
            <MathView
              block
              math={`K_\\text{combinado} = K_\\text{elevación} \\cdot K_\\text{escala} = ${pointFactors.kElevation.toFixed(10)} \\cdot ${pointFactors.kScale.toFixed(10)}`}
            />
            <MathView
              block
              math={`K_\\text{combinado} = ${pointFactors.kCombined.toFixed(10)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
