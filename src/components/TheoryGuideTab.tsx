import React, { useState } from 'react';
import { MathView } from './MathView';
import { BookOpen, Compass, Layers, Info } from 'lucide-react';

export const TheoryGuideTab: React.FC = () => {
  const [sliderEast, setSliderEast] = useState<number>(613500);

  // Compute live scale factor for the slider East coordinate
  const displacementX = Math.abs(500000 - sliderEast);
  const qVal = 0.000001 * displacementX;
  const sampleP = 0.0123747; // approx for -13° lat
  const liveKScale = 0.9996 * (1 + sampleP * Math.pow(qVal, 2) + 0.00003 * Math.pow(qVal, 4));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span>Fundamentos de Geodesia Satelital y Proyección UTM (UNSA)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Compendio teórico y visualizador interactivo del factor de escala y superficies de referencia.
        </p>
      </div>

      {/* Interactive Canvas / Visualizer for Scale Factor */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Visualizador Interactivo de Deformación y Factor de Escala UTM
            </h3>
            <p className="text-xs text-slate-400">
              Deslice la coordenada Este para observar la posición respecto al Meridiano Central y las líneas secantes estándar.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Este: {sliderEast.toLocaleString()} m</span>
            <span className="text-slate-600">|</span>
            <span className={liveKScale > 1 ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
              K: {liveKScale.toFixed(8)} ({liveKScale > 1 ? 'K > 1' : 'K < 1'})
            </span>
          </div>
        </div>

        {/* Easting Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Borde Oeste (166,000 m)</span>
            <span className="text-amber-400 font-bold">Meridiano Central (500,000 m · Ko=0.9996)</span>
            <span>Borde Este (834,000 m)</span>
          </div>
          <input
            type="range"
            min="200000"
            max="800000"
            step="1000"
            value={sliderEast}
            onChange={(e) => setSliderEast(Number(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
        </div>

        {/* SVG Diagram of the UTM Zone cross section */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden">
          <svg viewBox="0 0 800 240" className="w-full h-auto">
            {/* Background Grid */}
            <defs>
              <linearGradient id="secantGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Cylinder Surface (Plane) */}
            <line x1="50" y1="120" x2="750" y2="120" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <text x="755" y="124" fill="#64748b" fontSize="10" fontFamily="monospace">Plano Cilindro</text>

            {/* Ellipsoid Arc (Curved) */}
            <path
              d="M 50 170 Q 400 70 750 170"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <text x="755" y="174" fill="#0ea5e9" fontSize="10" fontFamily="monospace">Elipsoide</text>

            {/* Central Meridian (X = 400) */}
            <line x1="400" y1="30" x2="400" y2="210" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="400" cy="120" r="4" fill="#f59e0b" />
            <text x="400" y="25" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              Meridiano Central (Ko = 0.9996)
            </text>
            <text x="400" y="225" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
              E = 500,000 m · K &lt; 1
            </text>

            {/* Standard Secant Line Left (~180 km left -> x ~ 270) */}
            <line x1="270" y1="50" x2="270" y2="200" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="270" y="45" fill="#10b981" fontSize="10" textAnchor="middle" fontFamily="monospace">
              Línea Estándar (K = 1)
            </text>
            <text x="270" y="215" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
              ~320,000 m
            </text>

            {/* Standard Secant Line Right (~180 km right -> x ~ 530) */}
            <line x1="530" y1="50" x2="530" y2="200" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="530" y="45" fill="#10b981" fontSize="10" textAnchor="middle" fontFamily="monospace">
              Línea Estándar (K = 1)
            </text>
            <text x="530" y="215" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
              ~680,000 m
            </text>

            {/* Zone K < 1 Shading */}
            <rect x="270" y="75" width="260" height="90" fill="#f59e0b" fillOpacity="0.05" rx="4" />
            <text x="400" y="150" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              ZONA K &lt; 1 (Reduce)
            </text>

            {/* Zones K > 1 Shading */}
            <text x="160" y="150" fill="#0ea5e9" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              K &gt; 1 (Amplía)
            </text>
            <text x="640" y="150" fill="#0ea5e9" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              K &gt; 1 (Amplía)
            </text>

            {/* Current Point Marker mapped from slider (200k to 800k -> 100 to 700) */}
            {(() => {
              const markerX = 100 + ((sliderEast - 200000) / 600000) * 600;
              return (
                <g>
                  <line x1={markerX} y1="35" x2={markerX} y2="200" stroke="#ef4444" strokeWidth="2" />
                  <circle cx={markerX} cy="120" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  <rect x={markerX - 45} y="60" width="90" height="22" rx="4" fill="#7f1d1d" stroke="#ef4444" />
                  <text x={markerX} y="75" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    Punto ({sliderEast}m)
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* 3 Core Geodetic Surfaces (from UNSA slide 6, 8, 9, 10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider">
            1. Superficie Topográfica
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Es el relieve físico terrestre real con sus montañas, quebradas y valles. Sobre ella se miden las distancias topográficas ($L_T$) e inclinadas mediante estación total o GNSS.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider">
            2. Geoide (Equipotencial)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Superficie equipotencial del campo gravitatorio terrestre que coincide sensiblemente con el nivel medio del mar. Es irregular debido a las anomalías de masa terrestre.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-purple-400 font-mono uppercase tracking-wider">
            3. Elipsoide de Referencia
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Figura geométrica regular (elipsoide biaxial en revolución) matemáticamente definida que aproxima la forma de la Tierra ($a, b, f, e^2$). Base de la cartografía y proyecciones.
          </p>
        </div>
      </div>

      {/* Master Formula Dictionary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
          Fórmulas Clave de Geodesia Satelital (UNSA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-amber-400 font-mono block">
              Zona UTM y Meridiano Central
            </span>
            <MathView block math={`P = \\text{truncar}\\left( \\frac{\\lambda}{6} + 31 \\right)`} />
            <MathView block math={`\\lambda_0 = P \\cdot 6 - 183^\\circ`} />
            <MathView block math={`\\Delta\\lambda = \\lambda - \\lambda_0 \\quad (\\text{en radianes})`} />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-amber-400 font-mono block">
              Radios de Curvatura Principales
            </span>
            <MathView block math={`N = \\frac{a}{\\sqrt{1 - e^2 \\sin^2\\phi}} \\quad (\\text{Gran Normal})`} />
            <MathView block math={`\\rho = \\frac{a (1 - e^2)}{(1 - e^2 \\sin^2\\phi)^{3/2}} \\quad (\\text{Meridiano})`} />
            <MathView block math={`R = \\sqrt{\\rho \\cdot N} \\quad (\\text{Radio Medio})`} />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-amber-400 font-mono block">
              Factores de Reducción
            </span>
            <MathView block math={`K_\\text{escala} = K_0 \\left[ 1 + P \\cdot q^2 + 0.00003 \\cdot q^4 \\right]`} />
            <MathView block math={`K_\\text{elevación} = \\frac{R}{R + h}`} />
            <MathView block math={`K_\\text{combinado} = K_\\text{elevación} \\cdot K_\\text{escala}`} />
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-amber-400 font-mono block">
              Reducción de Distancias
            </span>
            <MathView block math={`L_C = \\sqrt{(E_B - E_A)^2 + (N_B - N_A)^2}`} />
            <MathView block math={`L_0 = \\frac{L_C}{K_\\text{escala, medio}}`} />
            <MathView block math={`L_T = \\frac{L_0}{K_\\text{elev, medio}} = \\frac{L_C}{K_\\text{combinado, medio}}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
