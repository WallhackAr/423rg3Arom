import React, { useState, useMemo } from 'react';
import { Download, Sparkles, HelpCircle, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';
import {
  calculateGeodesicToUtm,
  dmsToDecimal,
  formatDecimalAsDms,
  UNSA_PRESETS,
} from '../utils/geodesyMath';
import { DMSCoordinate, GeodesicInput } from '../types/geodesy';
import { MathView } from './MathView';
import { exportGeodesicToUtmPdf } from '../utils/pdfExport';

export const GeodesicToUtmTab: React.FC = () => {
  // Input states - Grupo 3 por defecto
  const [pointName, setPointName] = useState('Punto A7');
  const [cui, setCui] = useState('Grupo 3');
  const [ellipsoidKey, setEllipsoidKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');
  
  // Latitude DMS (Grupo 3: Punto A7: 13° 22' 25.95" S)
  const [latDeg, setLatDeg] = useState(13);
  const [latMin, setLatMin] = useState(22);
  const [latSec, setLatSec] = useState(25.95);
  const [latDir, setLatDir] = useState<'N' | 'S'>('S');

  // Longitude DMS (Grupo 3: Punto A7: 73° 56' 40.11" W)
  const [lonDeg, setLonDeg] = useState(73);
  const [lonMin, setLonMin] = useState(56);
  const [lonSec, setLonSec] = useState(40.11);
  const [lonDir, setLonDir] = useState<'E' | 'W'>('W');

  // Optional forced zone (Zona 18 para Grupo 3)
  const [zoneMode, setZoneMode] = useState<'auto' | 'forced'>('forced');
  const [forcedZone, setForcedZone] = useState<number>(18);

  // Height (Grupo 3: Punto A7: 3650.305 m)
  const [height, setHeight] = useState<string>('3650.305');

  const [copied, setCopied] = useState(false);

  // Load preset
  const loadPreset = (presetKey: keyof typeof UNSA_PRESETS) => {
    const p = UNSA_PRESETS[presetKey];
    setPointName(p.name);
    if (p.cui) setCui(p.cui);
    setLatDeg(p.latDms.degrees);
    setLatMin(p.latDms.minutes);
    setLatSec(p.latDms.seconds);
    setLatDir(p.latDms.direction as 'N' | 'S');

    setLonDeg(p.lonDms.degrees);
    setLonMin(p.lonDms.minutes);
    setLonSec(p.lonDms.seconds);
    setLonDir(p.lonDms.direction as 'E' | 'W');

    if (p.forcedZone) {
      setZoneMode('forced');
      setForcedZone(p.forcedZone);
    } else {
      setZoneMode('auto');
    }

    if (p.h !== undefined) {
      setHeight(p.h.toString());
    }
  };

  // Perform transformation calculation
  const calculationResult = useMemo(() => {
    const latDms: DMSCoordinate = {
      degrees: Number(latDeg) || 0,
      minutes: Number(latMin) || 0,
      seconds: Number(latSec) || 0,
      direction: latDir,
    };
    const lonDms: DMSCoordinate = {
      degrees: Number(lonDeg) || 0,
      minutes: Number(lonMin) || 0,
      seconds: Number(lonSec) || 0,
      direction: lonDir,
    };

    const hNum = height.trim() !== '' ? parseFloat(height) : undefined;

    const input: GeodesicInput = {
      pointName,
      cui,
      latDms,
      lonDms,
      ellipsoidKey,
      forcedZone: zoneMode === 'forced' ? forcedZone : null,
      h: !isNaN(hNum as number) ? hNum : undefined,
    };

    return calculateGeodesicToUtm(input);
  }, [
    pointName,
    cui,
    ellipsoidKey,
    latDeg,
    latMin,
    latSec,
    latDir,
    lonDeg,
    lonMin,
    lonSec,
    lonDir,
    zoneMode,
    forcedZone,
    height,
  ]);

  const handleCopySummary = () => {
    const text = `Resultados Geodesia Satelital - UNSA (${pointName}):
Este: ${calculationResult.E_final.toFixed(3)} m
Norte: ${calculationResult.N_final.toFixed(3)} m
Zona UTM: ${calculationResult.zone} (MC: ${calculationResult.centralMeridianDeg}°)
Kescala: ${calculationResult.k_scale.toFixed(10)}
${calculationResult.k_elevation ? `Kelevación: ${calculationResult.k_elevation.toFixed(10)}\nKcombinado: ${calculationResult.k_combined?.toFixed(10)}` : ''}`;
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
              Transformación de Coordenadas Geodésicas a UTM
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo directo por desarrollo en serie trigonométrica (Coticchia-Surace / UNSA).
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden md:inline">Grupo 3:</span>
            <button
              onClick={() => loadPreset('A7')}
              className="px-2.5 py-1 text-xs bg-red-950/70 hover:bg-red-900 text-red-100 border border-red-700/80 rounded-md transition-colors cursor-pointer font-medium"
            >
              Punto A7
            </button>
            <button
              onClick={() => loadPreset('P7')}
              className="px-2.5 py-1 text-xs bg-red-950/70 hover:bg-red-900 text-red-100 border border-red-700/80 rounded-md transition-colors cursor-pointer font-medium"
            >
              Punto P7
            </button>
            <button
              onClick={() => loadPreset('A8')}
              className="px-2.5 py-1 text-xs bg-red-950/70 hover:bg-red-900 text-red-100 border border-red-700/80 rounded-md transition-colors cursor-pointer font-medium"
            >
              Punto A8
            </button>
            <button
              onClick={() => loadPreset('P8')}
              className="px-2.5 py-1 text-xs bg-red-950/70 hover:bg-red-900 text-red-100 border border-red-700/80 rounded-md transition-colors cursor-pointer font-medium"
            >
              Punto P8
            </button>
            <span className="text-slate-600 hidden lg:inline">|</span>
            <button
              onClick={() => loadPreset('PB62_Z19')}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              PB62 Z19
            </button>
            <button
              onClick={() => loadPreset('PB62_Z18')}
              className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-md transition-colors cursor-pointer"
            >
              PB62 Z18
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2.5">
              1. Parámetros de Entrada
            </h3>

            {/* Point Identification */}
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
                  placeholder="ej. PB62, A8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Código Estudiante (CUI)
                </label>
                <input
                  type="text"
                  value={cui}
                  onChange={(e) => setCui(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  placeholder="19863613"
                />
              </div>
            </div>

            {/* Datum Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Datum / Elipsoide de Referencia
              </label>
              <select
                value={ellipsoidKey}
                onChange={(e) => setEllipsoidKey(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="WGS84">WGS 84 (GPS / Oficial Perú)</option>
                <option value="HAYFORD">Hayford / Internacional 1924 (PSAD56)</option>
              </select>
            </div>

            {/* Latitude Inputs */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Latitud Geodésica (φ)
                </label>
                <span className="text-[11px] font-mono text-cyan-400">
                  {calculationResult.latDecimal.toFixed(8)}° ({calculationResult.latRadians.toFixed(9)} rad)
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
                    <option value="S">S (Sur -)</option>
                    <option value="N">N (Norte +)</option>
                  </select>
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Hemisferio</span>
                </div>
              </div>
            </div>

            {/* Longitude Inputs */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Longitud Geodésica (λ)
                </label>
                <span className="text-[11px] font-mono text-cyan-400">
                  {calculationResult.lonDecimal.toFixed(8)}° ({calculationResult.lonRadians.toFixed(9)} rad)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <input
                    type="number"
                    value={lonDeg}
                    onChange={(e) => setLonDeg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Grados"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Grados (°)</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={lonMin}
                    onChange={(e) => setLonMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Min"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Min (′)</span>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.0001"
                    value={lonSec}
                    onChange={(e) => setLonSec(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                    placeholder="Seg"
                  />
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Seg (″)</span>
                </div>
                <div>
                  <select
                    value={lonDir}
                    onChange={(e) => setLonDir(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none"
                  >
                    <option value="W">W (Oeste -)</option>
                    <option value="E">E (Este +)</option>
                  </select>
                  <span className="block text-[10px] text-slate-500 text-center mt-0.5">Orientación</span>
                </div>
              </div>
            </div>

            {/* UTM Zone Controls */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Zona UTM
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setZoneMode('auto')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                    zoneMode === 'auto'
                      ? 'bg-slate-800 border-red-500/80 text-white font-medium'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Automática: Zona {Math.trunc(calculationResult.zoneFormulaVal)}
                </button>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoneMode('forced')}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${
                      zoneMode === 'forced'
                        ? 'bg-slate-800 border-red-500/80 text-white font-medium'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fijar:
                  </button>
                  <select
                    disabled={zoneMode !== 'forced'}
                    value={forcedZone}
                    onChange={(e) => setForcedZone(Number(e.target.value))}
                    aria-label="Zona fijada manualmente"
                    className="flex-1 bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1 text-white disabled:opacity-40"
                  >
                    <option value={17}>Zona 17 (MC 81° W)</option>
                    <option value={18}>Zona 18 (MC 75° W)</option>
                    <option value={19}>Zona 19 (MC 69° W)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Height (Optional) */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Altura Elipsoidal h (metros) — Opcional
              </label>
              <input
                type="number"
                step="0.001"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                placeholder="ej. 3848.100"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Permite calcular el Factor de Elevación y Factor Combinado.
              </span>
            </div>

            {/* Export PDF Button */}
            <div className="pt-3">
              <button
                onClick={() => exportGeodesicToUtmPdf(calculationResult)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Descargar Memoria de Cálculo (PDF)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Coordenada Este (E)
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400">
                {calculationResult.E_final.toLocaleString('en-US', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{' '}
                <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                X: {calculationResult.X.toFixed(3)} m
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Coordenada Norte (N)
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {calculationResult.N_final.toLocaleString('en-US', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{' '}
                <span className="text-xs text-slate-400 font-normal">m</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {calculationResult.isSouthHemisphere ? 'Hemisferio Sur' : 'Hemisferio Norte'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Zona UTM & MC
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                Zona {calculationResult.zone}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                MC λo: {calculationResult.centralMeridianDeg}° W
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Factor de Escala (Kescala)
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-white">
                {calculationResult.k_scale.toFixed(10)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {calculationResult.k_scale > 1 ? 'K > 1 (Amplía)' : 'K < 1 (Reduce)'}
              </span>
            </div>

            {calculationResult.k_elevation && (
              <>
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Factor Elevación (Kelev)
                  </span>
                  <div className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                    {calculationResult.k_elevation.toFixed(10)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    h = {calculationResult.h?.toFixed(2)} m
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Factor Combinado (Kcomb)
                  </span>
                  <div className="text-base sm:text-lg font-bold font-mono text-purple-300">
                    {calculationResult.k_combined?.toFixed(10)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    Kelev · Kescala
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Official PB62 Matrix Table from PDF UNSA */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Matriz de Cálculo Oficial PB62 (UNSA)
              </h3>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copiado' : 'Copiar Resultados'}</span>
              </button>
            </div>

            <div className="overflow-x-auto text-[11px] font-mono border border-slate-800 rounded-lg">
              <table className="w-full border-collapse text-center">
                <tbody>
                  {/* Table Row 1 */}
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">P (Zona)</td>
                    <td className="p-2 border-r border-slate-800">λo (MC)</td>
                    <td className="p-2 border-r border-slate-800">Δλ (radianes)</td>
                    <td className="p-2 border-r border-slate-800">t = tg(φ)</td>
                    <td className="p-2 border-r border-slate-800">η² (n2)</td>
                    <td className="p-2">N (Radio Gran Normal)</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800 font-bold text-amber-400">{calculationResult.zone}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.centralMeridianDeg}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.deltaLonRad.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.t.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.eta2.toFixed(9)}</td>
                    <td className="p-2 font-semibold text-cyan-300">
                      {calculationResult.N_radio.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>
                  </tr>

                  {/* Table Row 2 */}
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">E'</td>
                    <td className="p-2 border-r border-slate-800">E (Este Final)</td>
                    <td className="p-2 border-r border-slate-800">A0</td>
                    <td className="p-2 border-r border-slate-800">A2</td>
                    <td className="p-2 border-r border-slate-800">A4</td>
                    <td className="p-2">A6</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800">{calculationResult.E_prime.toFixed(4)}</td>
                    <td className="p-2 border-r border-slate-800 font-bold text-cyan-400">
                      {calculationResult.E_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.A0.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.A2.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.A4.toExponential(5)}</td>
                    <td className="p-2">{calculationResult.A6.toExponential(5)}</td>
                  </tr>

                  {/* Table Row 3 */}
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 font-medium">
                    <td colSpan={2} className="p-2 border-r border-slate-800">AM (Arco de Meridiano)</td>
                    <td colSpan={2} className="p-2 border-r border-slate-800">N' (Norte Provisional)</td>
                    <td colSpan={2} className="p-2">N (Norte Final)</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td colSpan={2} className="p-2 border-r border-slate-800">{calculationResult.AM.toFixed(3)}</td>
                    <td colSpan={2} className="p-2 border-r border-slate-800">{calculationResult.N_prime.toFixed(3)}</td>
                    <td colSpan={2} className="p-2 font-bold text-emerald-400">
                      {calculationResult.N_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </td>
                  </tr>

                  {/* Table Row 4 */}
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">N</td>
                    <td className="p-2 border-r border-slate-800">2 * N² * Ko²</td>
                    <td className="p-2 border-r border-slate-800">e'²</td>
                    <td className="p-2 border-r border-slate-800">1 + e'² * cos²φ</td>
                    <td colSpan={2} className="p-2">P (Factor)</td>
                  </tr>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800">
                      {calculationResult.N_radio.toFixed(3)}
                    </td>
                    <td className="p-2 border-r border-slate-800">
                      {calculationResult.twoN2K02.toExponential(9).toUpperCase()}
                    </td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.ellipsoid.ePrime2.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.onePlusEprime2Cos2Phi.toFixed(10)}</td>
                    <td colSpan={2} className="p-2 font-semibold text-purple-300">{calculationResult.P_factor.toFixed(11)}</td>
                  </tr>

                  {/* Table Row 5 */}
                  <tr className="bg-slate-800/80 text-slate-400 border-b border-slate-800 font-medium">
                    <td className="p-2 border-r border-slate-800">X = |500000 - E|</td>
                    <td className="p-2 border-r border-slate-800">q = 10⁻⁶ * X</td>
                    <td className="p-2 border-r border-slate-800">P * q²</td>
                    <td className="p-2 border-r border-slate-800">0.00003 * q⁴</td>
                    <td colSpan={2} className="p-2">K escala</td>
                  </tr>
                  <tr className="bg-slate-950/60 text-slate-200">
                    <td className="p-2 border-r border-slate-800">{calculationResult.X.toFixed(4)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.q.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.P_q2.toFixed(9)}</td>
                    <td className="p-2 border-r border-slate-800">{calculationResult.q4_term.toExponential(8)}</td>
                    <td colSpan={2} className="p-2 font-bold text-white bg-red-950/40">
                      {calculationResult.k_scale.toFixed(10)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Procedure with LaTeX and Replacement */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Procedimiento Detallado con Fórmulas Matemáticas Tipo LaTeX</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">UNSA · Geodesia Satelital</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1 */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-semibold text-red-400 font-mono">
              PASO 1: Determinación de la Zona UTM y Meridiano Central
            </div>
            <MathView
              block
              math={`P = \\text{truncar}\\left( \\frac{\\lambda}{6} + 31 \\right) = \\text{truncar}\\left( \\frac{${calculationResult.lonDecimal.toFixed(4)}}{6} + 31 \\right) = ${calculationResult.zone}`}
            />
            <MathView
              block
              math={`\\lambda_0 = P \\cdot 6 - 183^\\circ = ${calculationResult.zone} \\cdot 6 - 183^\\circ = ${calculationResult.centralMeridianDeg}^\\circ`}
            />
            <MathView
              block
              math={`\\Delta\\lambda = \\lambda - \\lambda_0 = ${calculationResult.lonDecimal.toFixed(6)}^\\circ - (${calculationResult.centralMeridianDeg}^\\circ) = ${calculationResult.deltaLonRad.toFixed(9)}\\text{ rad}`}
            />
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-semibold text-red-400 font-mono">
              PASO 2: Radio de la Gran Normal (N) y Parámetros
            </div>
            <MathView
              block
              math={`t = \\tan(\\phi) = \\tan(${calculationResult.latDecimal.toFixed(4)}^\\circ) = ${calculationResult.t.toFixed(9)}`}
            />
            <MathView
              block
              math={`\\eta^2 = e'^2 \\cdot \\cos^2(\\phi) = ${calculationResult.ellipsoid.ePrime2.toFixed(7)} \\cdot \\cos^2(${calculationResult.latDecimal.toFixed(4)}^\\circ) = ${calculationResult.eta2.toFixed(9)}`}
            />
            <MathView
              block
              math={`N = \\frac{a}{\\sqrt{1 - e^2 \\sin^2(\\phi)}} = \\frac{${calculationResult.ellipsoid.a}}{\\sqrt{1 - ${calculationResult.ellipsoid.e2.toFixed(7)} \\sin^2(\\phi)}} = ${calculationResult.N_radio.toFixed(3)}\\text{ m}`}
            />
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-semibold text-red-400 font-mono">
              PASO 3: Coordenada Este (E)
            </div>
            <MathView
              block
              math={`E' = (\\Delta\\lambda \\cos\\phi) N + \\frac{(\\Delta\\lambda \\cos\\phi)^3 N (1 - t^2 + \\eta^2)}{6} + \\dots = ${calculationResult.E_prime.toFixed(4)}\\text{ m}`}
            />
            <MathView
              block
              math={`E = 500\\,000 + 0.9996 \\cdot E' = 500\\,000 + 0.9996 (${calculationResult.E_prime.toFixed(4)}) = ${calculationResult.E_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}\\text{ m}`}
            />
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2.5">
            <div className="text-xs font-semibold text-red-400 font-mono">
              PASO 4: Coordenada Norte (N)
            </div>
            <MathView
              block
              math={`AM = a \\left( A_0 \\phi - A_2 \\sin 2\\phi + A_4 \\sin 4\\phi - A_6 \\sin 6\\phi \\right) = ${calculationResult.AM.toFixed(3)}\\text{ m}`}
            />
            <MathView
              block
              math={`N' = AM + \\frac{(\\Delta\\lambda \\cos\\phi)^2 N t}{2} + \\dots = ${calculationResult.N_prime.toFixed(3)}\\text{ m}`}
            />
            <MathView
              block
              math={`N = 10\\,000\\,000 + 0.9996 \\cdot N' = ${calculationResult.N_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}\\text{ m}`}
            />
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2.5 md:col-span-2">
            <div className="text-xs font-semibold text-red-400 font-mono">
              PASO 5: Factor de Escala Puntual (Kescala)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MathView
                block
                math={`X = |500\\,000 - E| = ${calculationResult.X.toFixed(4)}\\text{ m} \\quad ; \\quad q = 10^{-6} \\cdot X = ${calculationResult.q.toFixed(9)}`}
              />
              <MathView
                block
                math={`P = \\left[ \\frac{1 + e'^2 \\cos^2\\phi}{2 N^2 K_0^2} \\right] \\cdot 10^{12} = ${calculationResult.P_factor.toFixed(11)}`}
              />
            </div>
            <MathView
              block
              math={`K_\\text{escala} = K_0 \\left[ 1 + P \\cdot q^2 + 0.00003 \\cdot q^4 \\right] = 0.9996 \\left[ 1 + ${calculationResult.P_q2.toFixed(9)} + ${calculationResult.q4_term.toExponential(4)} \\right] = ${calculationResult.k_scale.toFixed(10)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
