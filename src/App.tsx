/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { GeodesicToUtmTab } from './components/GeodesicToUtmTab';
import { PointFactorsTab } from './components/PointFactorsTab';
import { DistancesTab } from './components/DistancesTab';
import { DirectionsTab } from './components/DirectionsTab';
import { UtmToGeodesicTab } from './components/UtmToGeodesicTab';
import { ProjectTableTab } from './components/ProjectTableTab';
import { TheoryGuideTab } from './components/TheoryGuideTab';
import { BookOpen, X, ExternalLink, Compass } from 'lucide-react';
import { MathView } from './components/MathView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('geodesic_to_utm');
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickGuide={() => setIsQuickGuideOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'geodesic_to_utm' && <GeodesicToUtmTab />}
        {activeTab === 'point_factors' && <PointFactorsTab />}
        {activeTab === 'distances' && <DistancesTab />}
        {activeTab === 'directions' && <DirectionsTab />}
        {activeTab === 'utm_to_geodesic' && <UtmToGeodesicTab />}
        {activeTab === 'project_table' && <ProjectTableTab />}
        {activeTab === 'theory' && <TheoryGuideTab />}
      </main>

      {/* Quick Guide Modal */}
      {isQuickGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Guía Rápida de Fórmulas · Geodesia UNSA
                </h3>
              </div>
              <button
                onClick={() => setIsQuickGuideOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-red-400 block font-mono">
                  1. Zona UTM y Meridiano Central (MC)
                </span>
                <MathView block math="P = \text{truncar}\left(\frac{\lambda}{6} + 31\right) \quad ; \quad \lambda_0 = P \cdot 6 - 183^\circ \quad ; \quad \Delta\lambda = \lambda - \lambda_0" />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-red-400 block font-mono">
                  2. Factor de Escala Puntual (Kescala)
                </span>
                <MathView block math="X = |500\,000 - E| \quad ; \quad q = 10^{-6} \cdot X \quad ; \quad P = \left[\frac{1 + e'^2\cos^2\phi}{2N^2K_0^2}\right] \cdot 10^{12}" />
                <MathView block math="K_\text{escala} = 0.9996 \cdot \left[1 + P \cdot q^2 + 0.00003 \cdot q^4\right]" />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-red-400 block font-mono">
                  3. Factor de Elevación y Factor Combinado
                </span>
                <MathView block math="R = \sqrt{\rho \cdot N} \quad ; \quad K_\text{elevación} = \frac{R}{R + h} \quad ; \quad K_\text{combinado} = K_\text{elevación} \cdot K_\text{escala}" />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-red-400 block font-mono">
                  4. Reducción de Distancias entre Alineamientos
                </span>
                <MathView block math="L_C = \sqrt{(\Delta E)^2 + (\Delta N)^2} \quad ; \quad L_0 = \frac{L_C}{K_\text{escala, m}} \quad ; \quad L_T = \frac{L_0}{K_\text{elev, m}} = \frac{L_C}{K_\text{comb, m}}" />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-red-400 block font-mono">
                  5. Cálculo de Direcciones, Curvatura y Azimut Geográfico (UNSA)
                </span>
                <MathView block math="(T - t)_{A\to B} = -\Delta N \cdot (2x_1 + x_2) \cdot P \cdot 6.8755 \times 10^{-8} \quad [ \text{segundos} ]" />
                <MathView block math="T = t + (T - t) \quad ; \quad Z_G = T + \gamma" />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsQuickGuideOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Universidad Nacional de San Agustín de Arequipa</span>
            <span aria-hidden="true">·</span>
            <span>Facultad de Ingeniería Civil</span>
            <span aria-hidden="true">·</span>
            <span>Geodesia Satelital</span>
          </div>
          <div>
            <span>Metodología Coticchia-Surace &amp; WGS 84 / PSAD 56</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
