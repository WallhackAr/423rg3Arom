import React, { useState, useMemo } from 'react';
import { Download, ArrowRight, Layers, Table, RotateCcw } from 'lucide-react';
import {
  calculateAlignmentDistance,
  calculatePointFactors,
  dmsToDecimal,
  UNSA_PRESETS,
} from '../utils/geodesyMath';
import { MathView } from './MathView';
import { exportDistancesPdf } from '../utils/pdfExport';
import { PointFactorsResult } from '../types/geodesy';

export const DistancesTab: React.FC = () => {
  // Built-in points initialized to P8 and A7 (Grupo 3 por defecto)
  const [pointAName, setPointAName] = useState('Punto P8 (Grupo 3)');
  const [latADeg, setLatADeg] = useState(13);
  const [latAMin, setLatAMin] = useState(22);
  const [latASec, setLatASec] = useState(25.37);
  const [eastA, setEastA] = useState(613815.195);
  const [northA, setNorthA] = useState(8521294.574);
  const [hA, setHA] = useState(3820.242);

  const [pointBName, setPointBName] = useState('Punto A7 (Grupo 3)');
  const [latBDeg, setLatBDeg] = useState(13);
  const [latBMin, setLatBMin] = useState(22);
  const [latBSec, setLatBSec] = useState(25.95);
  const [eastB, setEastB] = useState(614294.617);
  const [northB, setNorthB] = useState(8521274.715);
  const [hB, setHB] = useState(3650.305);

  const [datumKey, setDatumKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');

  // Load predefined alignments from Grupo 3
  const loadPresetAlignment = (type: 'P8-A7' | 'P8-P7' | 'P8-A8') => {
    // P8 is always Point A
    const p8 = UNSA_PRESETS.P8;
    setPointAName('P8');
    setLatADeg(p8.latDms.degrees);
    setLatAMin(p8.latDms.minutes);
    setLatASec(p8.latDms.seconds);
    setEastA(p8.east ?? 613815.195);
    setNorthA(p8.north ?? 8521294.574);
    setHA(p8.h ?? 3820.242);

    if (type === 'P8-A7') {
      const a7 = UNSA_PRESETS.A7;
      setPointBName('A7');
      setLatBDeg(a7.latDms.degrees);
      setLatBMin(a7.latDms.minutes);
      setLatBSec(a7.latDms.seconds);
      setEastB(a7.east ?? 614294.617);
      setNorthB(a7.north ?? 8521274.715);
      setHB(a7.h ?? 3650.305);
    } else if (type === 'P8-P7') {
      const p7 = UNSA_PRESETS.P7;
      setPointBName('P7');
      setLatBDeg(p7.latDms.degrees);
      setLatBMin(p7.latDms.minutes);
      setLatBSec(p7.latDms.seconds);
      setEastB(p7.east ?? 614387.274);
      setNorthB(p7.north ?? 8521346.216);
      setHB(p7.h ?? 3612.033);
    } else if (type === 'P8-A8') {
      const a8 = UNSA_PRESETS.A8;
      setPointBName('A8');
      setLatBDeg(a8.latDms.degrees);
      setLatBMin(a8.latDms.minutes);
      setLatBSec(a8.latDms.seconds);
      setEastB(a8.east ?? 613555.259);
      setNorthB(a8.north ?? 8520719.899);
      setHB(a8.h ?? 3848.100);
    }
  };

  // Compute Point A factors
  const factorA: PointFactorsResult = useMemo(() => {
    const latDec = -1 * (latADeg + latAMin / 60 + latASec / 3600);
    return calculatePointFactors(pointAName, datumKey, latDec, eastA, northA, hA);
  }, [pointAName, datumKey, latADeg, latAMin, latASec, eastA, northA, hA]);

  // Compute Point B factors
  const factorB: PointFactorsResult = useMemo(() => {
    const latDec = -1 * (latBDeg + latBMin / 60 + latBSec / 3600);
    return calculatePointFactors(pointBName, datumKey, latDec, eastB, northB, hB);
  }, [pointBName, datumKey, latBDeg, latBMin, latBSec, eastB, northB, hB]);

  // Compute Alignment Reduction
  const alignmentResult = useMemo(() => {
    const name = `${pointAName} - ${pointBName}`;
    return calculateAlignmentDistance(name, factorA, factorB);
  }, [pointAName, pointBName, factorA, factorB]);

  return (
    <div className="space-y-6">
      {/* Top Banner with PDF Presets */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Cálculo y Reducción de Distancias Geodésicas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conversión entre Distancia de Cuadrícula (Lc), Geodésica (Lo) y Topográfica de Terreno (Lt).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Alineamientos del PDF:</span>
            <button
              onClick={() => loadPresetAlignment('P8-A7')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer font-medium"
            >
              P8 - A7 (480.233 m)
            </button>
            <button
              onClick={() => loadPresetAlignment('P8-P7')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer font-medium"
            >
              P8 - P7 (574.881 m)
            </button>
            <button
              onClick={() => loadPresetAlignment('P8-A8')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer font-medium"
            >
              P8 - A8 (631.261 m)
            </button>
          </div>
        </div>
      </div>

      {/* Inputs for Point A and Point B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Point A Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase font-mono tracking-wider">
              Vértice Origen (Punto A)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Kescala: {factorA.kScale.toFixed(8)}
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
              <label className="block text-[11px] text-slate-400 mb-0.5">Latitud Sur (G M S)</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  value={latADeg}
                  onChange={(e) => setLatADeg(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
                <input
                  type="number"
                  value={latAMin}
                  onChange={(e) => setLatAMin(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
                <input
                  type="number"
                  step="0.01"
                  value={latASec}
                  onChange={(e) => setLatASec(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Este (m)</label>
              <input
                type="number"
                step="0.001"
                value={eastA}
                onChange={(e) => setEastA(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Norte (m)</label>
              <input
                type="number"
                step="0.001"
                value={northA}
                onChange={(e) => setNorthA(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Altura h (m)</label>
              <input
                type="number"
                step="0.001"
                value={hA}
                onChange={(e) => setHA(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Point B Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase font-mono tracking-wider">
              Vértice Destino (Punto B)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Kescala: {factorB.kScale.toFixed(8)}
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
              <label className="block text-[11px] text-slate-400 mb-0.5">Latitud Sur (G M S)</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  value={latBDeg}
                  onChange={(e) => setLatBDeg(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
                <input
                  type="number"
                  value={latBMin}
                  onChange={(e) => setLatBMin(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
                <input
                  type="number"
                  step="0.01"
                  value={latBSec}
                  onChange={(e) => setLatBSec(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Este (m)</label>
              <input
                type="number"
                step="0.001"
                value={eastB}
                onChange={(e) => setEastB(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Norte (m)</label>
              <input
                type="number"
                step="0.001"
                value={northB}
                onChange={(e) => setNorthB(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-0.5">Altura h (m)</label>
              <input
                type="number"
                step="0.001"
                value={hB}
                onChange={(e) => setHB(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Results: Distance Reduction Comparison (Official UNSA Slide Table) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Cuadro Resumen de Distancias ({alignmentResult.alignmentName})
            </h3>
            <p className="text-xs text-slate-400">
              Estructura oficial idéntica al cuadro de las diapositivas de la UNSA.
            </p>
          </div>

          <button
            onClick={() => exportDistancesPdf(alignmentResult)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar Memoria de Distancias (PDF)
          </button>
        </div>

        {/* 3 Large Distance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Distancia de Cuadrícula (Lc)
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {alignmentResult.distGrid.toFixed(3)}{' '}
              <span className="text-xs text-slate-400 font-normal">m</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Lc = √[(ΔE)² + (ΔN)²]
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Distancia Geodésica (Lo)
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {alignmentResult.distGeodesic.toFixed(3)}{' '}
              <span className="text-xs text-slate-400 font-normal">m</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Lo = Lc / Kescala_promedio
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Distancia Topográfica (Lt)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {alignmentResult.distTopographic.toFixed(3)}{' '}
              <span className="text-xs text-slate-400 font-normal">m</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Lt = Lo / Kelev = Lc / Kcombinado
            </span>
          </div>
        </div>

        {/* Table representation matching PDF 2 */}
        <div className="overflow-x-auto text-xs font-mono border border-slate-800 rounded-lg">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                <th className="p-2.5 border-r border-slate-800">Alineamiento</th>
                <th className="p-2.5 border-r border-slate-800">Distancia Geodésica (Lo)</th>
                <th className="p-2.5 border-r border-slate-800">Distancia de Cuadrícula (Lc)</th>
                <th className="p-2.5 border-r border-slate-800">Distancia Topográfica (Lt)</th>
                <th className="p-2.5">Diferencia (Lt - Lc)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-950/60 text-slate-100 font-semibold">
                <td className="p-2.5 border-r border-slate-800 text-red-300 font-bold">
                  {alignmentResult.alignmentName}
                </td>
                <td className="p-2.5 border-r border-slate-800 text-amber-400 font-bold">
                  {alignmentResult.distGeodesic.toFixed(3)} m
                </td>
                <td className="p-2.5 border-r border-slate-800 text-cyan-400 font-bold">
                  {alignmentResult.distGrid.toFixed(3)} m
                </td>
                <td className="p-2.5 border-r border-slate-800 text-emerald-400 font-bold">
                  {alignmentResult.distTopographic.toFixed(3)} m
                </td>
                <td className="p-2.5 font-bold text-slate-300">
                  +{alignmentResult.diffGridVsTopo.toFixed(3)} m
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Factors of the line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Kescala Promedio</span>
            <span className="text-slate-200 font-bold">{alignmentResult.meanKScale.toFixed(10)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Kelevación Promedio</span>
            <span className="text-slate-200 font-bold">{alignmentResult.meanKElevation.toFixed(10)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Kcombinado Promedio</span>
            <span className="text-purple-300 font-bold">{alignmentResult.meanKCombined.toFixed(10)}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Altura Media (hm)</span>
            <span className="text-slate-200 font-bold">{alignmentResult.meanHeight.toFixed(3)} m</span>
          </div>
        </div>
      </div>

      {/* LaTeX Step-by-Step Procedure */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Fórmulas y Desarrollo Matemático de Reducción
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-red-400 font-mono block">
              1. Distancia de Cuadrícula
            </span>
            <MathView
              block
              math={`L_C = \\sqrt{(E_B - E_A)^2 + (N_B - N_A)^2}`}
            />
            <MathView
              block
              math={`L_C = \\sqrt{(${alignmentResult.deltaE.toFixed(2)})^2 + (${alignmentResult.deltaN.toFixed(2)})^2} = ${alignmentResult.distGrid.toFixed(3)}\\text{ m}`}
            />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-red-400 font-mono block">
              2. Distancia Geodésica
            </span>
            <MathView
              block
              math={`L_0 = \\frac{L_C}{K_\\text{escala, medio}}`}
            />
            <MathView
              block
              math={`L_0 = \\frac{${alignmentResult.distGrid.toFixed(3)}}{${alignmentResult.meanKScale.toFixed(7)}} = ${alignmentResult.distGeodesic.toFixed(3)}\\text{ m}`}
            />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-red-400 font-mono block">
              3. Distancia Topográfica
            </span>
            <MathView
              block
              math={`L_T = \\frac{L_0}{K_\\text{elev}} = \\frac{L_C}{K_\\text{combinado}}`}
            />
            <MathView
              block
              math={`L_T = \\frac{${alignmentResult.distGrid.toFixed(3)}}{${alignmentResult.meanKCombined.toFixed(7)}} = ${alignmentResult.distTopographic.toFixed(3)}\\text{ m}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
