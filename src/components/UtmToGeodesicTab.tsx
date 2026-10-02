import React, { useState, useMemo } from 'react';
import { Download, Compass, Copy, Check } from 'lucide-react';
import { calculateUtmToGeodesic, formatDms, UNSA_PRESETS } from '../utils/geodesyMath';
import { MathView } from './MathView';
import { exportUtmToGeodesicPdf } from '../utils/pdfExport';

export const UtmToGeodesicTab: React.FC = () => {
  const [pointName, setPointName] = useState('Punto Inverso');
  const [east, setEast] = useState<number>(613495.358);
  const [north, setNorth] = useState<number>(8520781.602);
  const [zone, setZone] = useState<number>(18);
  const [hemisphere, setHemisphere] = useState<'N' | 'S'>('S');
  const [datumKey, setDatumKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');

  const [copied, setCopied] = useState(false);

  // Load Presets
  const loadPreset = (presetKey: keyof typeof UNSA_PRESETS) => {
    const p = UNSA_PRESETS[presetKey];
    setPointName(p.name);
    setEast(p.east || 500000);
    setNorth(p.north || 8500000);
    if (p.forcedZone) setZone(p.forcedZone);
  };

  const inverseResult = useMemo(() => {
    return calculateUtmToGeodesic(
      pointName,
      Number(east) || 500000,
      Number(north) || 8500000,
      Number(zone) || 18,
      hemisphere,
      datumKey
    );
  }, [pointName, east, north, zone, hemisphere, datumKey]);

  const handleCopy = () => {
    const text = `Transformación Inversa (${pointName}):
Latitud: ${formatDms(inverseResult.latDms)} (${inverseResult.latDecimal.toFixed(8)}°)
Longitud: ${formatDms(inverseResult.lonDms)} (${inverseResult.lonDecimal.toFixed(8)}°)
Zona UTM: ${inverseResult.zone} (${hemisphere === 'S' ? 'Sur' : 'Norte'})
Meridiano Central: ${inverseResult.centralMeridianDeg}°
Factor de Escala: ${inverseResult.kScale.toFixed(10)}`;
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
            <h2 className="text-base font-semibold text-white">
              Transformación Inversa: Coordenadas UTM a Geodésicas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recuperación rigurosa de Latitud (φ) y Longitud (λ) mediante la latitud de pie de perpendicular (Redfearn).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Cargar punto UTM:</span>
            <button
              onClick={() => loadPreset('A8')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              UTM A8
            </button>
            <button
              onClick={() => loadPreset('P8')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              UTM P8
            </button>
            <button
              onClick={() => loadPreset('A7')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              UTM A7
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2.5">
              Coordenadas Planas de Entrada
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Identificador del Punto
              </label>
              <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Zona UTM (1 - 60)
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value={17}>Zona 17 (MC 81° W)</option>
                  <option value={18}>Zona 18 (MC 75° W)</option>
                  <option value={19}>Zona 19 (MC 69° W)</option>
                  <option value={16}>Zona 16 (MC 87° W)</option>
                  <option value={35}>Zona 35 (MC 27° E)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Hemisferio
                </label>
                <select
                  value={hemisphere}
                  onChange={(e) => setHemisphere(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="S">Sur (Falso Norte: 10,000,000 m)</option>
                  <option value="N">Norte (Falso Norte: 0 m)</option>
                </select>
              </div>
            </div>

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
                Datum
              </label>
              <select
                value={datumKey}
                onChange={(e) => setDatumKey(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="WGS84">WGS 84 (GPS)</option>
                <option value="HAYFORD">Hayford (PSAD56)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => exportUtmToGeodesicPdf(inverseResult)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Descargar Memoria Inversa en PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Recovered Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Latitude Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Latitud Geodésica Recuperada (φ)
              </span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {formatDms(inverseResult.latDms)}
              </div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">
                {inverseResult.latDecimal.toFixed(9)}°
              </span>
            </div>

            {/* Longitude Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Longitud Geodésica Recuperada (λ)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {formatDms(inverseResult.lonDms)}
              </div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">
                {inverseResult.lonDecimal.toFixed(9)}°
              </span>
            </div>
          </div>

          {/* Auxiliary Properties */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Parámetros Geodésicos de la Transformación
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Meridiano Central</span>
                <span className="text-amber-400 font-bold">{inverseResult.centralMeridianDeg}° W</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Factor de Escala (K)</span>
                <span className="text-slate-200 font-bold">{inverseResult.kScale.toFixed(8)}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Latitud Pie (φ1)</span>
                <span className="text-slate-200 font-bold">{inverseResult.footprintLatDeg.toFixed(6)}°</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block">Convergencia (γ)</span>
                <span className="text-purple-300 font-bold">{inverseResult.convergenceMeridianDeg.toFixed(5)}°</span>
              </div>
            </div>
          </div>

          {/* Mathematical Form */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase">
              Fórmula Inversa (Redfearn / Coticchia)
            </h4>
            <div className="p-3 bg-slate-950/80 rounded border border-slate-800/80 space-y-2">
              <MathView
                block
                math={`\\phi = \\phi_1 - \\frac{N_1 \\tan\\phi_1}{R_1} \\left[ \\frac{D^2}{2} - \\frac{D^4}{24} (5 + 3T_1 + 10C_1 - 4C_1^2 - 9e'^2) \\right]`}
              />
              <MathView
                block
                math={`\\lambda = \\lambda_0 + \\frac{1}{\\cos\\phi_1} \\left[ D - \\frac{D^3}{6} (1 + 2T_1 + C_1) + \\dots \\right]`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
