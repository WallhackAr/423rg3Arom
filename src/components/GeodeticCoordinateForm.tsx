import React, { useState, useEffect } from 'react';
import { DMSCoordinate } from '../types/geodesy';
import { dmsToDecimal, decimalToDms } from '../utils/geodesyMath';
import { AlertCircle, Calculator, RotateCcw } from 'lucide-react';

export interface GeodeticFormValues {
  pointName: string;
  latDms: DMSCoordinate;
  lonDms: DMSCoordinate;
  latDecimal: number;
  lonDecimal: number;
  altitude: number;
}

interface GeodeticCoordinateFormProps {
  initialValues?: Partial<GeodeticFormValues>;
  onSubmit: (values: GeodeticFormValues) => void;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  isLoading?: boolean;
  showPointName?: boolean;
  showAltitude?: boolean;
  className?: string;
  presets?: {
    name: string;
    latDms: DMSCoordinate;
    lonDms: DMSCoordinate;
    altitude?: number;
  }[];
}

export const GeodeticCoordinateForm: React.FC<GeodeticCoordinateFormProps> = ({
  initialValues,
  onSubmit,
  title = 'Entrada de Coordenadas Geodésicas',
  subtitle = 'Ingrese latitud, longitud y altitud elipsoidal en formato sexagesimal (GMS)',
  submitButtonText = 'Ejecutar Cálculo',
  isLoading = false,
  showPointName = true,
  showAltitude = true,
  className = '',
  presets,
}) => {
  // Input mode: 'dms' or 'decimal'
  const [inputMode, setInputMode] = useState<'dms' | 'decimal'>('dms');

  // Point Name
  const [pointName, setPointName] = useState(initialValues?.pointName || 'Punto A7');

  // Latitude DMS (Grupo 3: Punto A7: 13° 22' 25.95" S)
  const [latDeg, setLatDeg] = useState<number>(initialValues?.latDms?.degrees ?? 13);
  const [latMin, setLatMin] = useState<number>(initialValues?.latDms?.minutes ?? 22);
  const [latSec, setLatSec] = useState<number>(initialValues?.latDms?.seconds ?? 25.95);
  const [latDir, setLatDir] = useState<'N' | 'S'>(
    initialValues?.latDms?.direction === 'N' || initialValues?.latDms?.direction === 'S'
      ? initialValues.latDms.direction
      : 'S'
  );

  // Longitude DMS (Grupo 3: Punto A7: 73° 56' 40.11" W)
  const [lonDeg, setLonDeg] = useState<number>(initialValues?.lonDms?.degrees ?? 73);
  const [lonMin, setLonMin] = useState<number>(initialValues?.lonDms?.minutes ?? 56);
  const [lonSec, setLonSec] = useState<number>(initialValues?.lonDms?.seconds ?? 40.11);
  const [lonDir, setLonDir] = useState<'E' | 'W'>(
    initialValues?.lonDms?.direction === 'E' || initialValues?.lonDms?.direction === 'W'
      ? initialValues.lonDms.direction
      : 'W'
  );

  // Decimal states for direct decimal entry
  const [latDecInput, setLatDecInput] = useState<string>(
    initialValues?.latDecimal !== undefined ? initialValues.latDecimal.toString() : '-13.37387500'
  );
  const [lonDecInput, setLonDecInput] = useState<string>(
    initialValues?.lonDecimal !== undefined ? initialValues.lonDecimal.toString() : '-73.94447500'
  );

  // Altitude (Grupo 3: 3650.305 m)
  const [altitude, setAltitude] = useState<string>(
    initialValues?.altitude !== undefined ? initialValues.altitude.toString() : '3650.305'
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when initialValues change externally
  useEffect(() => {
    if (initialValues?.pointName) setPointName(initialValues.pointName);
    if (initialValues?.latDms) {
      setLatDeg(initialValues.latDms.degrees);
      setLatMin(initialValues.latDms.minutes);
      setLatSec(initialValues.latDms.seconds);
      if (initialValues.latDms.direction === 'N' || initialValues.latDms.direction === 'S') {
        setLatDir(initialValues.latDms.direction);
      }
    }
    if (initialValues?.lonDms) {
      setLonDeg(initialValues.lonDms.degrees);
      setLonMin(initialValues.lonDms.minutes);
      setLonSec(initialValues.lonDms.seconds);
      if (initialValues.lonDms.direction === 'E' || initialValues.lonDms.direction === 'W') {
        setLonDir(initialValues.lonDms.direction);
      }
    }
    if (initialValues?.altitude !== undefined) {
      setAltitude(initialValues.altitude.toString());
    }
  }, [initialValues]);

  // Derived current decimals
  const currentLatDecimal = React.useMemo(() => {
    if (inputMode === 'decimal') {
      const v = parseFloat(latDecInput);
      return isNaN(v) ? 0 : v;
    }
    return dmsToDecimal({
      degrees: Number(latDeg) || 0,
      minutes: Number(latMin) || 0,
      seconds: Number(latSec) || 0,
      direction: latDir,
    });
  }, [inputMode, latDecInput, latDeg, latMin, latSec, latDir]);

  const currentLonDecimal = React.useMemo(() => {
    if (inputMode === 'decimal') {
      const v = parseFloat(lonDecInput);
      return isNaN(v) ? 0 : v;
    }
    return dmsToDecimal({
      degrees: Number(lonDeg) || 0,
      minutes: Number(lonMin) || 0,
      seconds: Number(lonSec) || 0,
      direction: lonDir,
    });
  }, [inputMode, lonDecInput, lonDeg, lonMin, lonSec, lonDir]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (showPointName && !pointName.trim()) {
      newErrors.pointName = 'El nombre del punto es obligatorio';
    }

    if (inputMode === 'dms') {
      if (latDeg < 0 || latDeg > 90) newErrors.latDeg = 'Grados entre 0° y 90°';
      if (latMin < 0 || latMin >= 60) newErrors.latMin = 'Minutos entre 0′ y 59′';
      if (latSec < 0 || latSec >= 60) newErrors.latSec = 'Segundos entre 0″ y 59.999″';

      if (lonDeg < 0 || lonDeg > 180) newErrors.lonDeg = 'Grados entre 0° y 180°';
      if (lonMin < 0 || lonMin >= 60) newErrors.lonMin = 'Minutos entre 0′ y 59′';
      if (lonSec < 0 || lonSec >= 60) newErrors.lonSec = 'Segundos entre 0″ y 59.999″';
    } else {
      const latVal = parseFloat(latDecInput);
      if (isNaN(latVal) || latVal < -90 || latVal > 90) {
        newErrors.latDec = 'Latitud decimal entre -90.0° y +90.0°';
      }
      const lonVal = parseFloat(lonDecInput);
      if (isNaN(lonVal) || lonVal < -180 || lonVal > 180) {
        newErrors.lonDec = 'Longitud decimal entre -180.0° y +180.0°';
      }
    }

    if (showAltitude) {
      const altVal = parseFloat(altitude);
      if (isNaN(altVal)) {
        newErrors.altitude = 'Ingrese un valor numérico para la altitud';
      } else if (altVal < -500 || altVal > 9000) {
        newErrors.altitude = 'Altitud fuera de rango (-500m a 9000m)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalLatDms: DMSCoordinate;
    let finalLonDms: DMSCoordinate;
    let finalLatDecimal: number;
    let finalLonDecimal: number;

    if (inputMode === 'dms') {
      finalLatDms = {
        degrees: Number(latDeg) || 0,
        minutes: Number(latMin) || 0,
        seconds: Number(latSec) || 0,
        direction: latDir,
      };
      finalLonDms = {
        degrees: Number(lonDeg) || 0,
        minutes: Number(lonMin) || 0,
        seconds: Number(lonSec) || 0,
        direction: lonDir,
      };
      finalLatDecimal = currentLatDecimal;
      finalLonDecimal = currentLonDecimal;
    } else {
      finalLatDecimal = parseFloat(latDecInput);
      finalLonDecimal = parseFloat(lonDecInput);
      finalLatDms = decimalToDms(finalLatDecimal, true);
      finalLonDms = decimalToDms(finalLonDecimal, false);
    }

    const altVal = showAltitude ? parseFloat(altitude) || 0 : 0;

    onSubmit({
      pointName: pointName.trim(),
      latDms: finalLatDms,
      lonDms: finalLonDms,
      latDecimal: finalLatDecimal,
      lonDecimal: finalLonDecimal,
      altitude: altVal,
    });
  };

  const handleApplyPreset = (preset: {
    name: string;
    latDms: DMSCoordinate;
    lonDms: DMSCoordinate;
    altitude?: number;
  }) => {
    setPointName(preset.name);
    setLatDeg(preset.latDms.degrees);
    setLatMin(preset.latDms.minutes);
    setLatSec(preset.latDms.seconds);
    if (preset.latDms.direction === 'N' || preset.latDms.direction === 'S') {
      setLatDir(preset.latDms.direction);
    }

    setLonDeg(preset.lonDms.degrees);
    setLonMin(preset.lonDms.minutes);
    setLonSec(preset.lonDms.seconds);
    if (preset.lonDms.direction === 'E' || preset.lonDms.direction === 'W') {
      setLonDir(preset.lonDms.direction);
    }

    if (preset.altitude !== undefined) {
      setAltitude(preset.altitude.toString());
    }

    const latDec = dmsToDecimal(preset.latDms);
    const lonDec = dmsToDecimal(preset.lonDms);
    setLatDecInput(latDec.toFixed(8));
    setLonDecInput(lonDec.toFixed(8));
    setErrors({});
  };

  const handleReset = () => {
    setPointName('Punto A7');
    setLatDeg(13);
    setLatMin(22);
    setLatSec(25.95);
    setLatDir('S');
    setLonDeg(73);
    setLonMin(56);
    setLonSec(40.11);
    setLonDir('W');
    setAltitude('3650.305');
    setLatDecInput('-13.37387500');
    setLonDecInput('-73.94447500');
    setErrors({});
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-5 ${className}`}>
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Input Format Toggle (GMS vs Decimal) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputMode('dms')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              inputMode === 'dms'
                ? 'bg-red-900/50 text-red-200 border border-red-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sexagesimal (GMS)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('decimal')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              inputMode === 'decimal'
                ? 'bg-red-900/50 text-red-200 border border-red-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decimal (°)
          </button>
        </div>
      </div>

      {/* Preset pills if provided */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-slate-800/60">
          <span className="text-[11px] text-slate-400 mr-1">Cargar plantilla:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Point Name Input */}
        {showPointName && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre / Identificador del Punto
            </label>
            <input
              type="text"
              value={pointName}
              onChange={(e) => setPointName(e.target.value)}
              className={`w-full bg-slate-950 border ${
                errors.pointName ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none`}
              placeholder="ej. Punto A8, Vértice 01"
            />
            {errors.pointName && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.pointName}
              </span>
            )}
          </div>
        )}

        {/* Latitude Fields */}
        {inputMode === 'dms' ? (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Latitud Geodésica (φ)
              </label>
              <span className="text-[11px] font-mono text-cyan-400">
                {currentLatDecimal.toFixed(8)}° ({((currentLatDecimal * Math.PI) / 180).toFixed(9)} rad)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={latDeg}
                  onChange={(e) => setLatDeg(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.latDeg ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 90"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Grados (°)</span>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={latMin}
                  onChange={(e) => setLatMin(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.latMin ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 59"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Minutos (′)</span>
              </div>
              <div>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="59.9999"
                  value={latSec}
                  onChange={(e) => setLatSec(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.latSec ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 59.99"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Segundos (″)</span>
              </div>
              <div>
                <select
                  value={latDir}
                  onChange={(e) => setLatDir(e.target.value as 'N' | 'S')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="S">S (Sur -)</option>
                  <option value="N">N (Norte +)</option>
                </select>
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Hemisferio</span>
              </div>
            </div>
            {(errors.latDeg || errors.latMin || errors.latSec) && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.latDeg || errors.latMin || errors.latSec}
              </span>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Latitud Decimal φ (° con signo - para Sur)
            </label>
            <input
              type="number"
              step="0.00000001"
              value={latDecInput}
              onChange={(e) => setLatDecInput(e.target.value)}
              className={`w-full bg-slate-950 border ${
                errors.latDec ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none`}
              placeholder="ej. -13.37836389"
            />
            {errors.latDec && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.latDec}
              </span>
            )}
          </div>
        )}

        {/* Longitude Fields */}
        {inputMode === 'dms' ? (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Longitud Geodésica (λ)
              </label>
              <span className="text-[11px] font-mono text-cyan-400">
                {currentLonDecimal.toFixed(8)}° ({((currentLonDecimal * Math.PI) / 180).toFixed(9)} rad)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={lonDeg}
                  onChange={(e) => setLonDeg(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.lonDeg ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 180"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Grados (°)</span>
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={lonMin}
                  onChange={(e) => setLonMin(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.lonMin ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 59"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Minutos (′)</span>
              </div>
              <div>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="59.9999"
                  value={lonSec}
                  onChange={(e) => setLonSec(Number(e.target.value))}
                  className={`w-full bg-slate-950 border ${
                    errors.lonSec ? 'border-rose-500' : 'border-slate-700'
                  } rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none`}
                  placeholder="0 - 59.99"
                />
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Segundos (″)</span>
              </div>
              <div>
                <select
                  value={lonDir}
                  onChange={(e) => setLonDir(e.target.value as 'E' | 'W')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono focus:border-red-500 focus:outline-none cursor-pointer"
                >
                  <option value="W">W (Oeste -)</option>
                  <option value="E">E (Este +)</option>
                </select>
                <span className="block text-[10px] text-slate-500 text-center mt-0.5">Orientación</span>
              </div>
            </div>
            {(errors.lonDeg || errors.lonMin || errors.lonSec) && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.lonDeg || errors.lonMin || errors.lonSec}
              </span>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Longitud Decimal λ (° con signo - para Oeste)
            </label>
            <input
              type="number"
              step="0.00000001"
              value={lonDecInput}
              onChange={(e) => setLonDecInput(e.target.value)}
              className={`w-full bg-slate-950 border ${
                errors.lonDec ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none`}
              placeholder="ej. -73.95183611"
            />
            {errors.lonDec && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.lonDec}
              </span>
            )}
          </div>
        )}

        {/* Altitude (h) */}
        {showAltitude && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">
                Altura Elipsoidal h (metros sobre el elipsoide)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {parseFloat(altitude) ? `${parseFloat(altitude).toFixed(3)} m` : ''}
              </span>
            </div>
            <input
              type="number"
              step="0.001"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              className={`w-full bg-slate-950 border ${
                errors.altitude ? 'border-rose-500' : 'border-slate-700'
              } rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none`}
              placeholder="ej. 3848.100"
            />
            {errors.altitude && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {errors.altitude}
              </span>
            )}
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 active:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Calculator className="h-4 w-4" />
            <span>{isLoading ? 'Calculando...' : submitButtonText}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Restablecer valores"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
