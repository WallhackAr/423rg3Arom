import React, { useState, useMemo } from 'react';
import { Download, Plus, Trash2, RotateCcw, Compass, ArrowRight, Layers } from 'lucide-react';
import {
  calculatePointFactors,
  calculateAlignmentDistance,
  calculateGeodesicToUtm,
  UNSA_PRESETS,
} from '../utils/geodesyMath';
import { PointFactorsResult, DistanceAlignmentResult } from '../types/geodesy';
import { GeodeticCoordinateForm, GeodeticFormValues } from './GeodeticCoordinateForm';
import jsPDF from 'jspdf';

interface SurveyPoint {
  id: string;
  name: string;
  latDecimal: number;
  east: number;
  north: number;
  h: number;
}

export const ProjectTableTab: React.FC = () => {
  // Puntos por defecto: Grupo 3 (UNSA)
  const [points, setPoints] = useState<SurveyPoint[]>([
    {
      id: 'A7',
      name: 'Punto A7',
      latDecimal: -13.373875,
      east: 614294.617,
      north: 8521274.715,
      h: 3650.305,
    },
    {
      id: 'P7',
      name: 'Punto P7',
      latDecimal: -13.373225,
      east: 614387.274,
      north: 8521346.216,
      h: 3612.033,
    },
    {
      id: 'A8',
      name: 'Punto A8',
      latDecimal: -13.37891944,
      east: 613555.259,
      north: 8520719.899,
      h: 3848.100,
    },
    {
      id: 'P8',
      name: 'Punto P8',
      latDecimal: -13.37371389,
      east: 613815.195,
      north: 8521294.574,
      h: 3820.242,
    },
  ]);

  const [datumKey, setDatumKey] = useState<'WGS84' | 'HAYFORD'>('WGS84');
  const [showAddForm, setShowAddForm] = useState(false);

  // Compute Factors for all points
  const calculatedPoints: PointFactorsResult[] = useMemo(() => {
    return points.map((p) =>
      calculatePointFactors(p.name, datumKey, p.latDecimal, p.east, p.north, p.h)
    );
  }, [points, datumKey]);

  // Compute Alignments (e.g. from P8 to all other points, or consecutive)
  const alignments: DistanceAlignmentResult[] = useMemo(() => {
    if (calculatedPoints.length < 2) return [];

    // Find P8 or first point as base
    const p8Index = calculatedPoints.findIndex((p) => p.pointName.includes('P8'));
    const basePoint = p8Index >= 0 ? calculatedPoints[p8Index] : calculatedPoints[0];

    const results: DistanceAlignmentResult[] = [];
    calculatedPoints.forEach((pt) => {
      if (pt.pointName !== basePoint.pointName) {
        const alignName = `${basePoint.pointName.replace('Punto ', '')} - ${pt.pointName.replace('Punto ', '')}`;
        results.push(calculateAlignmentDistance(alignName, basePoint, pt));
      }
    });

    return results;
  }, [calculatedPoints]);

  // Add Point via reusable form
  const handleAddPoint = (val: GeodeticFormValues) => {
    const newId = `P_${Date.now()}`;
    const utm = calculateGeodesicToUtm({
      pointName: val.pointName,
      latDms: val.latDms,
      lonDms: val.lonDms,
      ellipsoidKey: datumKey,
      forcedZone: 18,
      h: val.altitude,
    });
    const newPt: SurveyPoint = {
      id: newId,
      name: val.pointName || `Vértice ${points.length + 1}`,
      latDecimal: val.latDecimal,
      east: Number(utm.E_final.toFixed(3)),
      north: Number(utm.N_final.toFixed(3)),
      h: val.altitude,
    };
    setPoints([...points, newPt]);
    setShowAddForm(false);
  };

  const handleRemovePoint = (id: string) => {
    if (points.length <= 2) {
      alert('Debe haber al menos 2 puntos en el proyecto para formar alineamientos.');
      return;
    }
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleResetToPdf = () => {
    setPoints([
      {
        id: 'A7',
        name: 'Punto A7',
        latDecimal: -13.373875,
        east: 614294.617,
        north: 8521274.715,
        h: 3650.305,
      },
      {
        id: 'P7',
        name: 'Punto P7',
        latDecimal: -13.373225,
        east: 614387.274,
        north: 8521346.216,
        h: 3612.033,
      },
      {
        id: 'A8',
        name: 'Punto A8',
        latDecimal: -13.37891944,
        east: 613555.259,
        north: 8520719.899,
        h: 3848.100,
      },
      {
        id: 'P8',
        name: 'Punto P8',
        latDecimal: -13.37371389,
        east: 613815.195,
        north: 8521294.574,
        h: 3820.242,
      },
    ]);
  };

  // Export Complete Project PDF Report
  const handleExportProjectPdf = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header
    doc.setFillColor(123, 17, 19);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('UNIVERSIDAD NACIONAL DE SAN AGUSTÍN · GEODESIA SATELITAL', 14, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('MEMORIA CONSOLIDADA DE FACTORES Y REDUCCIÓN DE ALINEAMIENTOS', 14, 16);

    // Gold accent
    doc.setFillColor(218, 165, 32);
    doc.rect(0, 20, pageWidth, 2, 'F');

    let y = 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. MATRIZ DE FACTORES DE ESCALA Y ELEVACIÓN POR PUNTO', 14, y);
    y += 5;

    // Points Table
    const headers = [
      'Punto',
      'Latitud (φ)',
      'Este (m)',
      'Norte (m)',
      'h (m)',
      'N (m)',
      'R (m)',
      'Kescala',
      'Kelevación',
      'Kcombinado',
    ];
    const colW = [24, 28, 27, 27, 20, 28, 28, 32, 32, 32];

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, pageWidth - 28, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    let curX = 14;
    headers.forEach((h, i) => {
      doc.text(h, curX + 2, y + 4.8);
      curX += colW[i];
    });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    calculatedPoints.forEach((pt, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, pageWidth - 28, 6.5, 'S');

      curX = 14;
      const row = [
        pt.pointName,
        pt.latDecimal.toFixed(8) + '°',
        pt.east.toFixed(3),
        pt.north.toFixed(3),
        pt.h.toFixed(3),
        pt.N.toFixed(3),
        pt.R.toFixed(3),
        pt.kScale.toFixed(10),
        pt.kElevation.toFixed(10),
        pt.kCombined.toFixed(10),
      ];

      row.forEach((cell, cellIdx) => {
        doc.text(cell, curX + 2, y + 4.5);
        curX += colW[cellIdx];
      });
      y += 6.5;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. CUADRO OFICIAL DE REDUCCIÓN DE DISTANCIAS (MÉTODO UNSA)', 14, y);
    y += 5;

    // Alignments Table
    const alignHeaders = [
      'Alineamiento',
      'Distancia Geodésica (Lo)',
      'Distancia de Cuadrícula (Lc)',
      'Distancia Topográfica (Lt)',
      'Diferencia (Lt - Lc)',
      'Kescala Medio',
      'Kelevación Medio',
      'Kcombinado Medio',
    ];
    const alignColW = [35, 38, 38, 38, 30, 33, 33, 33];

    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, pageWidth - 28, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    curX = 14;
    alignHeaders.forEach((h, i) => {
      doc.text(h, curX + 2, y + 4.8);
      curX += alignColW[i];
    });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);

    alignments.forEach((al, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, pageWidth - 28, 6.5, 'S');

      curX = 14;
      const row = [
        al.alignmentName,
        al.distGeodesic.toFixed(3) + ' m',
        al.distGrid.toFixed(3) + ' m',
        al.distTopographic.toFixed(3) + ' m',
        '+' + al.diffGridVsTopo.toFixed(3) + ' m',
        al.meanKScale.toFixed(10),
        al.meanKElevation.toFixed(10),
        al.meanKCombined.toFixed(10),
      ];

      row.forEach((cell, cellIdx) => {
        doc.text(cell, curX + 2, y + 4.5);
        curX += alignColW[cellIdx];
      });
      y += 6.5;
    });

    doc.save('Memoria_Proyecto_Geodesia_UNSA.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">
              Poligonal Geodésica y Matriz de Reducción Consolidada
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo simultáneo de factores de escala, elevación y distancias entre alineamientos (Caso de Estudio UNSA).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showAddForm ? 'Cerrar Formulario' : 'Agregar Vértice'}</span>
            </button>

            <button
              onClick={handleResetToPdf}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Restablecer puntos del PDF (A8, P8, A7, P7)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Puntos del PDF</span>
            </button>

            <button
              onClick={handleExportProjectPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar Proyecto (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally rendered reusable coordinate input form */}
      {showAddForm && (
        <div className="border border-red-900/40 rounded-xl overflow-hidden">
          <GeodeticCoordinateForm
            title="Agregar Nuevo Vértice Geodésico al Proyecto"
            subtitle="Ingrese las coordenadas del nuevo punto para incorporarlo a la matriz y recalcular alineamientos"
            submitButtonText="Incorporar Vértice al Proyecto"
            onSubmit={handleAddPoint}
            presets={[
              {
                name: 'Vértice 05',
                latDms: { degrees: 13, minutes: 22, seconds: 30.0, direction: 'S' },
                lonDms: { degrees: 73, minutes: 56, seconds: 50.0, direction: 'W' },
                altitude: 3700.0,
              },
            ]}
          />
        </div>
      )}

      {/* Table 1: Matrix of Points and Factors */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            1. Tabla de Coordenadas y Factores por Punto ({calculatedPoints.length} Vértices)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Datum: WGS 84</span>
        </div>

        <div className="overflow-x-auto text-xs font-mono border border-slate-800 rounded-lg">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                <th className="p-2 border-r border-slate-800 text-left">Punto</th>
                <th className="p-2 border-r border-slate-800">Latitud (φ)</th>
                <th className="p-2 border-r border-slate-800">Este (m)</th>
                <th className="p-2 border-r border-slate-800">Norte (m)</th>
                <th className="p-2 border-r border-slate-800">h (m)</th>
                <th className="p-2 border-r border-slate-800">Gran Normal (N)</th>
                <th className="p-2 border-r border-slate-800">Radio Medio (R)</th>
                <th className="p-2 border-r border-slate-800 text-cyan-300">Kescala</th>
                <th className="p-2 border-r border-slate-800 text-emerald-300">Kelevación</th>
                <th className="p-2 border-r border-slate-800 text-purple-300">Kcombinado</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {calculatedPoints.map((pt, idx) => {
                const originalPt = points[idx];
                return (
                  <tr
                    key={originalPt.id}
                    className="border-b border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/80 transition-colors"
                  >
                    <td className="p-2 border-r border-slate-800 text-left font-semibold text-white">
                      {pt.pointName}
                    </td>
                    <td className="p-2 border-r border-slate-800 text-slate-300">
                      {pt.latDecimal.toFixed(8)}°
                    </td>
                    <td className="p-2 border-r border-slate-800 font-bold text-cyan-400">
                      {pt.east.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800 font-bold text-emerald-400">
                      {pt.north.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800 text-slate-200">
                      {pt.h.toFixed(3)}
                    </td>
                    <td className="p-2 border-r border-slate-800 text-slate-400">
                      {pt.N.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800 text-slate-400">
                      {pt.R.toLocaleString('en-US', { minimumFractionDigits: 3 })}
                    </td>
                    <td className="p-2 border-r border-slate-800 font-bold text-cyan-300">
                      {pt.kScale.toFixed(10)}
                    </td>
                    <td className="p-2 border-r border-slate-800 font-bold text-emerald-300">
                      {pt.kElevation.toFixed(10)}
                    </td>
                    <td className="p-2 border-r border-slate-800 font-bold text-purple-300 bg-red-950/20">
                      {pt.kCombined.toFixed(10)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleRemovePoint(originalPt.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1"
                        title="Eliminar punto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Alignments Table (Identical to UNSA Slides) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            2. Cuadro Oficial de Reducción de Distancias por Alineamiento
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono">
            Validado con Diapositivas UNSA
          </span>
        </div>

        <div className="overflow-x-auto text-xs font-mono border border-slate-800 rounded-lg">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-800">
                <th className="p-2.5 border-r border-slate-800">Alineamiento</th>
                <th className="p-2.5 border-r border-slate-800 text-amber-400 font-bold">
                  Distancia Geodésica (Lo)
                </th>
                <th className="p-2.5 border-r border-slate-800 text-cyan-400 font-bold">
                  Distancia Cuadrícula (Lc)
                </th>
                <th className="p-2.5 border-r border-slate-800 text-emerald-400 font-bold">
                  Distancia Topográfica (Lt)
                </th>
                <th className="p-2.5 border-r border-slate-800">Diferencia (Lt - Lc)</th>
                <th className="p-2.5 border-r border-slate-800">Kescala Medio</th>
                <th className="p-2.5">Kcombinado Medio</th>
              </tr>
            </thead>
            <tbody>
              {alignments.map((al, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/80 transition-colors"
                >
                  <td className="p-2.5 border-r border-slate-800 font-bold text-white text-left pl-4">
                    {al.alignmentName}
                  </td>
                  <td className="p-2.5 border-r border-slate-800 font-bold text-amber-400">
                    {al.distGeodesic.toFixed(3)} m
                  </td>
                  <td className="p-2.5 border-r border-slate-800 font-bold text-cyan-400">
                    {al.distGrid.toFixed(3)} m
                  </td>
                  <td className="p-2.5 border-r border-slate-800 font-bold text-emerald-400">
                    {al.distTopographic.toFixed(3)} m
                  </td>
                  <td className="p-2.5 border-r border-slate-800 font-semibold text-slate-300">
                    +{al.diffGridVsTopo.toFixed(3)} m
                  </td>
                  <td className="p-2.5 border-r border-slate-800 text-slate-300">
                    {al.meanKScale.toFixed(10)}
                  </td>
                  <td className="p-2.5 text-purple-300 font-semibold bg-red-950/20">
                    {al.meanKCombined.toFixed(10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
