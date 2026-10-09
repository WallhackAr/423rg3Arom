import React, { useState, useMemo } from 'react';
import { Download, Compass, Navigation, ArrowRight, RotateCcw, Copy, Check, Layers, Info } from 'lucide-react';
import {
  calculateLineDirections,
  calculateMeridianConvergence,
  formatAngleDms,
  formatAzimuthDms,
  UNSA_PRESETS,
} from '../utils/geodesyMath';
import { MathView } from './MathView';
import { exportDirectionsPdf, exportConvergencePdf } from '../utils/pdfExport';

export const DirectionsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'line' | 'point'>('line');

  // LINE DIRECTIONS STATE
  // Initial default: Example from UNSA Slides (Slide 15-17)
  const [pointAName, setPointAName] = useState('Punto A');
  const [eastA, setEastA] = useState<number>(363593.723);
  const [northA, setNorthA] = useState<number>(8702158.921);

  const [pointBName, setPointBName] = useState('Punto B');
  const [eastB, setEastB] = useState<number>(365205.924);
  const [northB, setNorthB] = useState<number>(8703453.021);

  const [zone, setZone] = useState<number>(18);
  const [hemisphere, setHemisphere] = useState<'N' | 'S'>('S');
  const [datumKey, setDatumKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');

  // SINGLE POINT CONVERGENCE STATE (Slide 14)
  const [convPointName, setConvPointName] = useState('Punto 1');
  const [convEast, setConvEast] = useState<number>(277076.003);
  const [convNorth, setConvNorth] = useState<number>(5342624.724);
  const [convZone, setConvZone] = useState<number>(24);
  const [convHemisphere, setConvHemisphere] = useState<'N' | 'S'>('N');

  const [copied, setCopied] = useState(false);

  // Line Calculation Result
  const lineResult = useMemo(() => {
    return calculateLineDirections(
      `${pointAName} -> ${pointBName}`,
      pointAName,
      pointBName,
      Number(eastA) || 0,
      Number(northA) || 0,
      Number(eastB) || 0,
      Number(northB) || 0,
      zone,
      hemisphere,
      datumKey
    );
  }, [pointAName, pointBName, eastA, northA, eastB, northB, zone, hemisphere, datumKey]);

  // Point Convergence Result
  const convResult = useMemo(() => {
    return calculateMeridianConvergence(
      convPointName,
      Number(convEast) || 0,
      Number(convNorth) || 0,
      convZone,
      convHemisphere,
      datumKey
    );
  }, [convPointName, convEast, convNorth, convZone, convHemisphere, datumKey]);

  // Presets for Line Directions
  const loadLinePreset = (type: 'UNSA_SLIDES' | 'GRUPO3_P8_A7' | 'GRUPO3_P8_P7' | 'GRUPO3_P8_A8') => {
    if (type === 'UNSA_SLIDES') {
      setPointAName('Punto A');
      setEastA(363593.723);
      setNorthA(8702158.921);
      setPointBName('Punto B');
      setEastB(365205.924);
      setNorthB(8703453.021);
      setZone(18);
      setHemisphere('S');
    } else if (type === 'GRUPO3_P8_A7') {
      setPointAName('P8');
      setEastA(UNSA_PRESETS.P8.east ?? 613815.195);
      setNorthA(UNSA_PRESETS.P8.north ?? 8521294.574);
      setPointBName('A7');
      setEastB(UNSA_PRESETS.A7.east ?? 614294.617);
      setNorthB(UNSA_PRESETS.A7.north ?? 8521274.715);
      setZone(18);
      setHemisphere('S');
    } else if (type === 'GRUPO3_P8_P7') {
      setPointAName('P8');
      setEastA(UNSA_PRESETS.P8.east ?? 613815.195);
      setNorthA(UNSA_PRESETS.P8.north ?? 8521294.574);
      setPointBName('P7');
      setEastB(UNSA_PRESETS.P7.east ?? 614387.274);
      setNorthB(UNSA_PRESETS.P7.north ?? 8521346.216);
      setZone(18);
      setHemisphere('S');
    } else if (type === 'GRUPO3_P8_A8') {
      setPointAName('P8');
      setEastA(UNSA_PRESETS.P8.east ?? 613815.195);
      setNorthA(UNSA_PRESETS.P8.north ?? 8521294.574);
      setPointBName('A8');
      setEastB(UNSA_PRESETS.A8.east ?? 613555.259);
      setNorthB(UNSA_PRESETS.A8.north ?? 8520719.899);
      setZone(18);
      setHemisphere('S');
    }
  };

  // Presets for Convergence (Slide 14)
  const loadConvPreset = (ex: 1 | 2 | 3 | 4) => {
    if (ex === 1) {
      setConvPointName('Ejemplo 1 (UNSA)');
      setConvEast(277076.003);
      setConvNorth(5342624.724);
      setConvZone(24);
      setConvHemisphere('N');
    } else if (ex === 2) {
      setConvPointName('Ejemplo 2 (UNSA)');
      setConvEast(277076.003);
      setConvNorth(8637242.342);
      setConvZone(24);
      setConvHemisphere('S');
    } else if (ex === 3) {
      setConvPointName('Ejemplo 3 (UNSA)');
      setConvEast(743223.742);
      setConvNorth(3421032.614);
      setConvZone(40);
      setConvHemisphere('N');
    } else if (ex === 4) {
      setConvPointName('Ejemplo 4 (UNSA)');
      setConvEast(743223.742);
      setConvNorth(7321037.021);
      setConvZone(19);
      setConvHemisphere('S');
    }
  };

  const handleCopyLine = () => {
    const text = `Cálculo de Direcciones UNSA (${lineResult.lineName}):
Azimut Plano (t): ${lineResult.azimuthPlaneDmsStr}
Corrección por Curvatura (T - t): ${lineResult.curvatureCorrectionDmsStr}
Azimut Geodésico Proyectado (T): ${lineResult.azimuthGeodeticProjectedDmsStr}
Convergencia de Meridianos (γ): ${lineResult.convergenceA.gammaDmsStr}
Azimut Geográfico o Verdadero (ZG): ${lineResult.azimuthGeographicDmsStr}
Rumbo: ${lineResult.bearingDmsStr}
Distancia: ${lineResult.distance.toFixed(3)} m`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-red-500" />
              <span>Cálculo de Direcciones y Convergencia de Meridianos (UNSA)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Azimut Plano (t), Corrección por Curvatura (T - t), Azimut Geodésico Proyectado (T), Convergencia (γ) y Azimut Geográfico (ZG).
            </p>
          </div>

          {/* Submode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSubTab('line')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                subTab === 'line'
                  ? 'bg-red-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Direcciones de Línea (A → B)
            </button>
            <button
              onClick={() => setSubTab('point')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                subTab === 'point'
                  ? 'bg-red-700 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Convergencia en un Punto (γ)
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: LINE DIRECTIONS */}
      {subTab === 'line' && (
        <div className="space-y-6">
          {/* Preset Buttons for Line */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 mr-1">Cargar plantilla de la diapositiva:</span>
              <button
                onClick={() => loadLinePreset('UNSA_SLIDES')}
                className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900 text-red-100 border border-red-700/80 rounded-md transition-colors cursor-pointer font-medium"
              >
                Ejemplo UNSA (Slide 15-17)
              </button>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 mr-1 hidden sm:inline">Grupo 3:</span>
              <button
                onClick={() => loadLinePreset('GRUPO3_P8_A7')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                P8 → A7
              </button>
              <button
                onClick={() => loadLinePreset('GRUPO3_P8_P7')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                P8 → P7
              </button>
              <button
                onClick={() => loadLinePreset('GRUPO3_P8_A8')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                P8 → A8
              </button>
            </div>

            <button
              onClick={() => exportDirectionsPdf(lineResult)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar Memoria de Direcciones (PDF)</span>
            </button>
          </div>

          {/* Line Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Point A */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase font-mono tracking-wider">
                  Vértice de Estación (Punto A)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  φA: {lineResult.latA_Decimal.toFixed(6)}°
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] text-slate-400 mb-0.5">Nombre</label>
                  <input
                    type="text"
                    value={pointAName}
                    onChange={(e) => setPointAName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-0.5">Coordenada Este EA (m)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={eastA}
                    onChange={(e) => setEastA(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Coordenada Norte NA (m)</label>
                <input
                  type="number"
                  step="0.001"
                  value={northA}
                  onChange={(e) => setNorthA(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                x₁ = |500 000 - EA| = <span className="text-white font-semibold">{lineResult.x1.toFixed(3)} m</span>
              </div>
            </div>

            {/* Point B */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-semibold text-emerald-400 uppercase font-mono tracking-wider">
                  Vértice Visado (Punto B)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  φB: {lineResult.latB_Decimal.toFixed(6)}°
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] text-slate-400 mb-0.5">Nombre</label>
                  <input
                    type="text"
                    value={pointBName}
                    onChange={(e) => setPointBName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-0.5">Coordenada Este EB (m)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={eastB}
                    onChange={(e) => setEastB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Coordenada Norte NB (m)</label>
                <input
                  type="number"
                  step="0.001"
                  value={northB}
                  onChange={(e) => setNorthB(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                x₂ = |500 000 - EB| = <span className="text-white font-semibold">{lineResult.x2.toFixed(3)} m</span>
              </div>
            </div>
          </div>

          {/* General Parameters (Zone, Hemisphere, Datum) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Zona UTM</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={18}>Zona 18 (MC 75° W)</option>
                  <option value={19}>Zona 19 (MC 69° W)</option>
                  <option value={17}>Zona 17 (MC 81° W)</option>
                  <option value={24}>Zona 24 (MC 39° W)</option>
                  <option value={40}>Zona 40 (MC 57° E)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Hemisferio</label>
                <select
                  value={hemisphere}
                  onChange={(e) => setHemisphere(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="S">Sur (Ecuador = 10 000 000 m)</option>
                  <option value="N">Norte (Ecuador = 0 m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Datum</label>
                <select
                  value={datumKey}
                  onChange={(e) => setDatumKey(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="WGS84">WGS 84 (GPS Oficial)</option>
                  <option value="HAYFORD">Hayford (PSAD 56)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Azimut Plano (t)
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-cyan-400">
                {lineResult.azimuthPlaneDmsStr}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Rumbo: {lineResult.bearingDmsStr}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Corrección Curvatura (T - t)
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-400">
                {lineResult.curvatureCorrectionDmsStr}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {lineResult.curvatureCorrectionSec.toFixed(4)}″
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Azimut Proyectado (T)
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {lineResult.azimuthGeodeticProjectedDmsStr}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                T = t + (T - t)
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Convergencia (γA)
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-indigo-300">
                {lineResult.convergenceA.gammaDmsStr}
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {lineResult.convergenceA.gammaDeg.toFixed(6)}°
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-red-900/40 bg-red-950/20 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono uppercase text-red-300 block mb-1">
                Azimut Geográfico (ZG)
              </span>
              <div className="text-base sm:text-lg font-extrabold font-mono text-white">
                {lineResult.azimuthGeographicDmsStr}
              </div>
              <span className="text-[10px] text-red-300 font-mono mt-1 block">
                ZG = T + γ
              </span>
            </div>
          </div>

          {/* Official Calculation Table from Slide 15-17 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                Cuadro Oficial de Resultados de Dirección ({lineResult.lineName})
              </h3>
              <button
                onClick={handleCopyLine}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copiado' : 'Copiar Resultados'}</span>
              </button>
            </div>

            <div className="overflow-x-auto text-xs font-mono border border-slate-800 rounded-lg">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                    <th className="p-2.5 border-r border-slate-800">Elemento</th>
                    <th className="p-2.5 border-r border-slate-800">Símbolo</th>
                    <th className="p-2.5 border-r border-slate-800">Valor Sexagesimal</th>
                    <th className="p-2.5 border-r border-slate-800">Valor Decimal</th>
                    <th className="p-2.5">Fórmula Aplicada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/60 bg-slate-950/60">
                    <td className="p-2.5 border-r border-slate-800 text-left pl-3 font-semibold text-white">
                      Azimut Plano de Cuadrícula
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-cyan-400">t</td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-cyan-400">
                      {lineResult.azimuthPlaneDmsStr}
                    </td>
                    <td className="p-2.5 border-r border-slate-800">{lineResult.azimuthPlaneDeg.toFixed(6)}°</td>
                    <td className="p-2.5 text-slate-400 text-left pl-3">arctan(ΔE / ΔN)</td>
                  </tr>

                  <tr className="border-b border-slate-800/60 bg-slate-950/60">
                    <td className="p-2.5 border-r border-slate-800 text-left pl-3 font-semibold text-white">
                      Corrección por Curvatura
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-amber-400">(T - t)</td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-amber-400">
                      {lineResult.curvatureCorrectionDmsStr}
                    </td>
                    <td className="p-2.5 border-r border-slate-800">{lineResult.curvatureCorrectionDeg.toFixed(8)}°</td>
                    <td className="p-2.5 text-slate-400 text-left pl-3">-ΔN·(2x₁ + x₂)·P·6.8755·10⁻⁸</td>
                  </tr>

                  <tr className="border-b border-slate-800/60 bg-slate-950/60">
                    <td className="p-2.5 border-r border-slate-800 text-left pl-3 font-semibold text-white">
                      Azimut Geodésico Proyectado
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-emerald-400">T</td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-emerald-400">
                      {lineResult.azimuthGeodeticProjectedDmsStr}
                    </td>
                    <td className="p-2.5 border-r border-slate-800">{lineResult.azimuthGeodeticProjectedDeg.toFixed(6)}°</td>
                    <td className="p-2.5 text-slate-400 text-left pl-3">t + (T - t)</td>
                  </tr>

                  <tr className="border-b border-slate-800/60 bg-slate-950/60">
                    <td className="p-2.5 border-r border-slate-800 text-left pl-3 font-semibold text-white">
                      Convergencia de Meridianos (A)
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-indigo-300">γ</td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-indigo-300">
                      {lineResult.convergenceA.gammaDmsStr}
                    </td>
                    <td className="p-2.5 border-r border-slate-800">{lineResult.convergenceA.gammaDeg.toFixed(6)}°</td>
                    <td className="p-2.5 text-slate-400 text-left pl-3">tan γ = L·t·cosφ + ...</td>
                  </tr>

                  <tr className="bg-red-950/30">
                    <td className="p-2.5 border-r border-slate-800 text-left pl-3 font-bold text-white">
                      Azimut Geográfico o Verdadero
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-extrabold text-white">ZG</td>
                    <td className="p-2.5 border-r border-slate-800 font-extrabold text-white">
                      {lineResult.azimuthGeographicDmsStr}
                    </td>
                    <td className="p-2.5 border-r border-slate-800 font-bold text-white">
                      {lineResult.azimuthGeographicDeg.toFixed(6)}°
                    </td>
                    <td className="p-2.5 text-red-200 font-semibold text-left pl-3">T + γ</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Intermediate Variables Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ΔN = NB - NA</span>
                <span className="text-slate-200 font-semibold">{lineResult.deltaN.toFixed(3)} m</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ΔE = EB - EA</span>
                <span className="text-slate-200 font-semibold">{lineResult.deltaE.toFixed(3)} m</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Radio Normal (N) en A</span>
                <span className="text-slate-200 font-semibold">{lineResult.N_radioA.toLocaleString('en-US', { minimumFractionDigits: 3 })} m</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Factor P en A</span>
                <span className="text-purple-300 font-semibold">{lineResult.P_factorA.toFixed(11)}</span>
              </div>
            </div>
          </div>

          {/* Detailed LaTeX Steps */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
              Desarrollo de Fórmulas Matemáticas Tipo LaTeX (Procedimiento Oficial UNSA)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-red-400 font-mono block">
                  1. Azimut Plano (t) y Rumbo
                </span>
                <MathView
                  block
                  math={`\\Delta E = E_B - E_A = ${lineResult.deltaE.toFixed(3)}\\text{ m} \\quad ; \\quad \\Delta N = N_B - N_A = ${lineResult.deltaN.toFixed(3)}\\text{ m}`}
                />
                <MathView
                  block
                  math={`\\text{Rumbo} = \\arctan\\left(\\left|\\frac{\\Delta E}{\\Delta N}\\right|\\right) = ${lineResult.bearingDmsStr}`}
                />
                <MathView
                  block
                  math={`t = ${lineResult.azimuthPlaneDmsStr} = ${lineResult.azimuthPlaneDeg.toFixed(6)}^\\circ`}
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-red-400 font-mono block">
                  2. Corrección por Curvatura (T - t)
                </span>
                <MathView
                  block
                  math={`(T - t)_{A\\to B} = -\\Delta N \\cdot (2x_1 + x_2) \\cdot P \\cdot 6.8755 \\times 10^{-8}`}
                />
                <MathView
                  block
                  math={`x_1 = ${lineResult.x1.toFixed(3)}\\text{ m} \\quad , \\quad x_2 = ${lineResult.x2.toFixed(3)}\\text{ m} \\quad , \\quad P = ${lineResult.P_factorA.toFixed(9)}`}
                />
                <MathView
                  block
                  math={`(T - t) = ${lineResult.curvatureCorrectionDmsStr} = ${lineResult.curvatureCorrectionSec.toFixed(4)}''`}
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-red-400 font-mono block">
                  3. Azimut Geodésico Proyectado (T)
                </span>
                <MathView
                  block
                  math={`T = t + (T - t)`}
                />
                <MathView
                  block
                  math={`T = ${lineResult.azimuthPlaneDmsStr} + (${lineResult.curvatureCorrectionDmsStr}) = ${lineResult.azimuthGeodeticProjectedDmsStr}`}
                />
              </div>

              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-red-400 font-mono block">
                  4. Azimut Geográfico o Verdadero (ZG)
                </span>
                <MathView
                  block
                  math={`Z_G = T + \\gamma`}
                />
                <MathView
                  block
                  math={`Z_G = ${lineResult.azimuthGeodeticProjectedDmsStr} + (${lineResult.convergenceA.gammaDmsStr}) = ${lineResult.azimuthGeographicDmsStr}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MERIDIAN CONVERGENCE AT A POINT */}
      {subTab === 'point' && (
        <div className="space-y-6">
          {/* Preset Buttons for Slide 14 Examples */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 mr-1">Ejemplos de la Diapositiva 14 (UNSA):</span>
              <button
                onClick={() => loadConvPreset(1)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Ejemplo 1 (Z24 N: -2° 14' 14.32")
              </button>
              <button
                onClick={() => loadConvPreset(2)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Ejemplo 2 (Z24 S: +0° 26' 15.20")
              </button>
              <button
                onClick={() => loadConvPreset(3)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Ejemplo 3 (Z40 N: +1° 18' 26.38")
              </button>
              <button
                onClick={() => loadConvPreset(4)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Ejemplo 4 (Z19 S: -0° 58' 56.22")
              </button>
            </div>

            <button
              onClick={() => exportConvergencePdf(convResult)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar Memoria de Convergencia (PDF)</span>
            </button>
          </div>

          {/* Point Convergence Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
                Coordenadas UTM del Punto
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre del Punto</label>
                <input
                  type="text"
                  value={convPointName}
                  onChange={(e) => setConvPointName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Coordenada Este (m)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={convEast}
                    onChange={(e) => setConvEast(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Coordenada Norte (m)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={convNorth}
                    onChange={(e) => setConvNorth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Zona UTM</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={convZone}
                    onChange={(e) => setConvZone(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hemisferio</label>
                  <select
                    value={convHemisphere}
                    onChange={(e) => setConvHemisphere(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="N">Norte (Ecuador = 0 m)</option>
                    <option value="S">Sur (Ecuador = 10 000 000 m)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Convergence Result Card & Sign Rules */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <span className="text-xs font-mono uppercase text-slate-400 block">
                  Convergencia de Meridianos (γ)
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
                  {convResult.gammaDmsStr}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Decimal: <span className="text-white font-semibold">{convResult.gammaDeg.toFixed(7)}°</span> ({convResult.gammaRad.toFixed(9)} rad)
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-amber-300 font-mono">
                  {convResult.quadrantSignRule}
                </div>
              </div>

              {/* Quadrant Sign Reference Card (Slide 6) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs space-y-2">
                <h4 className="font-semibold text-slate-200 font-mono uppercase text-[11px]">
                  Regla de Signo de "γ" en cada Cuadrante (Diapositiva 6)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">HN / Oeste MC</span>
                    <span className="text-rose-400 font-bold">γ (-)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">HN / Este MC</span>
                    <span className="text-emerald-400 font-bold">γ (+)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">HS / Oeste MC</span>
                    <span className="text-emerald-400 font-bold">γ (+)</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">HS / Este MC</span>
                    <span className="text-rose-400 font-bold">γ (-)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Form for Convergence (Slide 7) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 font-mono uppercase">
              Fórmula que gobierna la convergencia de meridianos en un punto (Slide 7 UNSA)
            </h4>
            <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
              <MathView
                block
                math={`\\tan\\gamma = L \\cdot t \\cdot \\cos\\phi + L^3 \\cdot t \\cdot \\left[ \\frac{1 + t^2 + 3\\eta^2 + 2\\eta^4}{3} \\right] \\cdot \\cos^3\\phi`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>t = tan(φ) = {convResult.t.toFixed(7)}</span>
                <span>η² = e'²·cos²φ = {convResult.eta2.toFixed(7)}</span>
                <span>Δλ = {convResult.deltaLonDeg.toFixed(5)}°</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
