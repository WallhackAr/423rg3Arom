import React from 'react';
import { Download, BookOpen, Layers, Compass } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickGuide,
}) => {
  const navTabs = [
    { id: 'geodesic_to_utm', label: 'Geodésicas a UTM' },
    { id: 'point_factors', label: 'Factores en Punto' },
    { id: 'distances', label: 'Cálculo de Distancias' },
    { id: 'directions', label: 'Direcciones y Azimuts' },
    { id: 'utm_to_geodesic', label: 'UTM a Geodésicas' },
    { id: 'project_table', label: 'Poligonal / Matriz' },
    { id: 'theory', label: 'Visualizador y Teoría' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          className="group flex items-center gap-2.5 text-base font-bold tracking-tight text-white focus:outline-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-900/40 border border-red-700/50 text-red-400 group-hover:border-red-500 transition-colors">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-wide text-slate-100">
            GEODESIA SATELITAL <span className="text-red-500 font-extrabold text-sm ml-1">UNSA</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links (4-6 single-line links) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-red-700 text-white shadow-sm shadow-red-950 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenQuickGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Ver fórmulas oficiales y teoría UNSA"
          >
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guía de Fórmulas</span>
          </button>

          {/* Mobile Tab Select Dropdown */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              aria-label="Seleccionar módulo geodésico"
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              {navTabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
