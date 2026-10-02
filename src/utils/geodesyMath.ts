/**
 * Geodesy Satelital - UNSA
 * Rigorous Geodetic Formulas and Step-by-Step Mathematical Procedures
 */

import {
  DMSCoordinate,
  Ellipsoid,
  ELLIPSOIDS,
  GeodesicInput,
  GeodesicToUtmResult,
  PointFactorsResult,
  DistanceAlignmentResult,
  UtmToGeodesicResult,
  PresetPoint,
} from '../types/geodesy';

/** Convert DMS to Decimal Degrees */
export function dmsToDecimal(dms: DMSCoordinate): number {
  const abs = Math.abs(dms.degrees) + dms.minutes / 60 + dms.seconds / 3600;
  return dms.direction === 'S' || dms.direction === 'W' ? -abs : abs;
}

/** Convert Decimal Degrees to DMS */
export function decimalToDms(decimal: number, isLatitude: boolean): DMSCoordinate {
  const isNegative = decimal < 0;
  const absVal = Math.abs(decimal);
  const degrees = Math.floor(absVal);
  const minutesFull = (absVal - degrees) * 60;
  const minutes = Math.floor(minutesFull);
  const seconds = (minutesFull - minutes) * 60;
  
  const direction: 'N' | 'S' | 'E' | 'W' = isLatitude
    ? (isNegative ? 'S' : 'N')
    : (isNegative ? 'W' : 'E');

  return { degrees, minutes, seconds: Number(seconds.toFixed(4)), direction };
}

/** Format DMS to clean string e.g. 13° 22' 42.11" S */
export function formatDms(dms: DMSCoordinate): string {
  return `${dms.degrees}° ${dms.minutes}' ${dms.seconds.toFixed(2)}" ${dms.direction}`;
}

/** Format Decimal to sexagesimal string representation */
export function formatDecimalAsDms(decimal: number, isLatitude: boolean): string {
  return formatDms(decimalToDms(decimal, isLatitude));
}

/** Calculate Geodesic to UTM Transformation Step-by-Step */
export function calculateGeodesicToUtm(input: GeodesicInput): GeodesicToUtmResult {
  const ellipsoid: Ellipsoid =
    input.ellipsoidKey === 'CUSTOM' && input.customEllipsoid
      ? input.customEllipsoid
      : ELLIPSOIDS[input.ellipsoidKey] || ELLIPSOIDS.WGS84;

  const latDecimal = dmsToDecimal(input.latDms);
  const lonDecimal = dmsToDecimal(input.lonDms);
  const latRadians = (latDecimal * Math.PI) / 180;
  const lonRadians = (lonDecimal * Math.PI) / 180;

  // Step A: Zona UTM
  // P = truncar( λ / 6 + 31 )
  const zoneFormulaVal = lonDecimal / 6 + 31;
  const zone = input.forcedZone !== undefined && input.forcedZone !== null
    ? input.forcedZone
    : Math.trunc(zoneFormulaVal);

  // Step B: Meridiano Central
  // λo = P * 6 - 183° (grados sexagesimales)
  const centralMeridianDeg = zone * 6 - 183;
  const centralMeridianRad = (centralMeridianDeg * Math.PI) / 180;

  // Step C: Δλ = λ - λo (en radianes)
  const deltaLonDeg = lonDecimal - centralMeridianDeg;
  const deltaLonRad = (deltaLonDeg * Math.PI) / 180;

  // Parámetros trigonométricos y radio de la gran normal
  // t = tg(φ)
  const t = Math.tan(latRadians);
  // η² = e'² * cos²(φ)
  const eta2 = ellipsoid.ePrime2 * Math.pow(Math.cos(latRadians), 2);
  // N = a / sqrt(1 - e² * sen²(φ))
  const sinLat = Math.sin(latRadians);
  const cosLat = Math.cos(latRadians);
  const N_radio = ellipsoid.a / Math.sqrt(1 - ellipsoid.e2 * Math.pow(sinLat, 2));

  // Step D: Cálculo de Este (E')
  // dl_cos = Δλ * cos(φ)
  const dlCos = deltaLonRad * cosLat;
  const dlCos3 = Math.pow(dlCos, 3);
  const dlCos5 = Math.pow(dlCos, 5);

  const E_term1 = dlCos * N_radio;
  const E_term2 = (dlCos3 * N_radio * (1 - Math.pow(t, 2) + eta2)) / 6;
  const E_term3 = (dlCos5 * N_radio * (5 - 18 * Math.pow(t, 2) + Math.pow(t, 4))) / 120;
  const E_prime = E_term1 + E_term2 + E_term3;

  // E = 500 000 + 0.9996 * E'
  const E_final = 500000 + ellipsoid.k0 * E_prime;

  // Step E: Cálculo de Norte (N')
  // Coeficientes del arco de meridiano
  const e2 = ellipsoid.e2;
  const e4 = Math.pow(e2, 2);
  const e6 = Math.pow(e2, 3);

  const A0 = 1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256;
  const A2 = (3 / 8) * (e2 + e4 / 4 + (15 * e6) / 128);
  const A4 = (15 / 256) * (e4 + (3 * e6) / 4);
  const A6 = (35 / 3072) * e6;

  // AM = a * (A0 * φ - A2 * sen(2φ) + A4 * sen(4φ) - A6 * sen(6φ))
  const AM =
    ellipsoid.a *
    (A0 * latRadians -
      A2 * Math.sin(2 * latRadians) +
      A4 * Math.sin(4 * latRadians) -
      A6 * Math.sin(6 * latRadians));

  const dlCos2 = Math.pow(dlCos, 2);
  const dlCos4 = Math.pow(dlCos, 4);
  const dlCos6 = Math.pow(dlCos, 6);

  const N_term1 = (dlCos2 * N_radio * t) / 2;
  const N_term2 =
    (dlCos4 * N_radio * t * (5 - Math.pow(t, 2) + 9 * eta2 + 4 * Math.pow(eta2, 2))) / 24;
  const N_term3 =
    (dlCos6 * N_radio * t * (61 - 58 * Math.pow(t, 2) + Math.pow(t, 4))) / 720;

  const N_prime = AM + N_term1 + N_term2 + N_term3;

  // Si hemisferio Sur: NORTE = 10,000,000.00 + 0.9996 * N' (N' es negativo)
  // Si hemisferio Norte: NORTE = 0.00 + 0.9996 * N'
  const isSouthHemisphere = latDecimal < 0;
  const N_final = isSouthHemisphere
    ? 10000000.0 + ellipsoid.k0 * N_prime
    : 0.0 + ellipsoid.k0 * N_prime;

  // Factor de Escala del Punto (Kescala)
  const X = Math.abs(500000 - E_final);
  const q = 0.000001 * X;
  const twoN2K02 = 2 * Math.pow(N_radio, 2) * Math.pow(ellipsoid.k0, 2);
  const onePlusEprime2Cos2Phi = 1 + ellipsoid.ePrime2 * Math.pow(cosLat, 2);
  const P_factor = (onePlusEprime2Cos2Phi / twoN2K02) * 1e12;
  const P_q2 = P_factor * Math.pow(q, 2);
  const q4_term = 0.00003 * Math.pow(q, 4);
  const k_scale = ellipsoid.k0 * (1 + P_q2 + q4_term);

  // Factor de elevación si se proporciona h
  let rho_radio: number | undefined;
  let R_mean: number | undefined;
  let k_elevation: number | undefined;
  let k_combined: number | undefined;

  if (input.h !== undefined && !isNaN(input.h)) {
    rho_radio =
      (ellipsoid.a * (1 - ellipsoid.e2)) /
      Math.pow(1 - ellipsoid.e2 * Math.pow(sinLat, 2), 1.5);
    R_mean = Math.sqrt(rho_radio * N_radio);
    k_elevation = R_mean / (R_mean + input.h);
    k_combined = k_elevation * k_scale;
  }

  return {
    pointName: input.pointName || 'Punto',
    cui: input.cui,
    ellipsoid,
    latDecimal,
    lonDecimal,
    latRadians,
    lonRadians,
    zone,
    zoneFormulaVal,
    centralMeridianDeg,
    centralMeridianRad,
    deltaLonDeg,
    deltaLonRad,
    t,
    eta2,
    N_radio,
    E_prime,
    E_term1,
    E_term2,
    E_term3,
    E_final,
    A0,
    A2,
    A4,
    A6,
    AM,
    N_prime,
    N_term1,
    N_term2,
    N_term3,
    isSouthHemisphere,
    N_final,
    X,
    q,
    twoN2K02,
    onePlusEprime2Cos2Phi,
    P_factor,
    P_q2,
    q4_term,
    k_scale,
    h: input.h,
    rho_radio,
    R_mean,
    k_elevation,
    k_combined,
  };
}

/** Calculate Geodetic Factors for a point with known Latitude, East, and Height */
export function calculatePointFactors(
  pointName: string,
  datumKey: 'WGS84' | 'HAYFORD' | 'CUSTOM',
  latDecimal: number,
  east: number,
  north: number,
  h: number,
  customEllipsoid?: Ellipsoid,
  lonDecimal?: number
): PointFactorsResult {
  const ellipsoid: Ellipsoid =
    datumKey === 'CUSTOM' && customEllipsoid
      ? customEllipsoid
      : ELLIPSOIDS[datumKey] || ELLIPSOIDS.WGS84;

  const latRadians = (latDecimal * Math.PI) / 180;
  const sinLat = Math.sin(latRadians);
  const cosLat = Math.cos(latRadians);

  // 1. Radio de la gran normal N
  const N = ellipsoid.a / Math.sqrt(1 - ellipsoid.e2 * Math.pow(sinLat, 2));

  // 2. Radio del meridiano ρ
  const rho =
    (ellipsoid.a * (1 - ellipsoid.e2)) /
    Math.pow(1 - ellipsoid.e2 * Math.pow(sinLat, 2), 1.5);

  // 3. Radio medio r = sqrt(ρ * N)
  const R = Math.sqrt(rho * N);

  // 4. Parámetros del factor de escala
  // 2 * N^2 * Ko^2
  const twoN2K02 = 2 * Math.pow(N, 2) * Math.pow(ellipsoid.k0, 2);
  // 1 + e'^2 * cos^2(φ)
  const onePlusEprime2Cos2Phi = 1 + ellipsoid.ePrime2 * Math.pow(cosLat, 2);
  // P = [(1 + e'^2 * cos^2(φ)) / (2 * N^2 * Ko^2)] * 10^12
  const P = (onePlusEprime2Cos2Phi / twoN2K02) * 1e12;

  // X = |500 000 - ESTE|
  const X = Math.abs(500000 - east);
  // q = 0.000001 * X
  const q = 0.000001 * X;
  const Pq2 = P * Math.pow(q, 2);
  const q4Term = 0.00003 * Math.pow(q, 4);

  // Kescala = Ko * [1 + P * q^2 + 0.00003 * q^4]
  const kScale = ellipsoid.k0 * (1 + Pq2 + q4Term);

  // Kelevación = R / (R + h)
  const kElevation = R / (R + h);

  // Kcombinado = Kelevación * Kescala
  const kCombined = kElevation * kScale;

  const latDms = decimalToDms(latDecimal, true);
  const lonDmsStr = lonDecimal !== undefined ? formatDecimalAsDms(lonDecimal, false) : undefined;

  return {
    pointName,
    datum: ellipsoid.name,
    latDecimal,
    lonDecimal,
    latDmsStr: formatDms(latDms),
    lonDmsStr,
    east,
    north,
    h,
    a: ellipsoid.a,
    b: ellipsoid.b,
    e2: ellipsoid.e2,
    ePrime2: ellipsoid.ePrime2,
    c: ellipsoid.c,
    k0: ellipsoid.k0,
    N,
    rho,
    R,
    twoN2K02,
    onePlusEprime2Cos2Phi,
    P,
    X,
    q,
    Pq2,
    q4Term,
    kScale,
    kElevation,
    kCombined,
  };
}

/** Calculate Alignments and Distances between Point A and Point B */
export function calculateAlignmentDistance(
  alignmentName: string,
  pointA: PointFactorsResult,
  pointB: PointFactorsResult
): DistanceAlignmentResult {
  // 1. Distancia de cuadrícula Lc = sqrt(ΔE^2 + ΔN^2)
  const deltaE = pointB.east - pointA.east;
  const deltaN = pointB.north - pointA.north;
  const distGrid = Math.sqrt(Math.pow(deltaE, 2) + Math.pow(deltaN, 2));

  // 2. Factores medios de la línea
  // Kescala medio = (Ka + Kb) / 2
  const meanKScale = (pointA.kScale + pointB.kScale) / 2;

  // Altura elipsoidal media y radio medio
  const meanHeight = (pointA.h + pointB.h) / 2;
  const meanR = (pointA.R + pointB.R) / 2;
  
  // Kelevación medio = Rm / (Rm + hm) or (KelevA + KelevB) / 2
  // En las diapositivas de la UNSA se utiliza (KelevA + KelevB)/2 o Rm / (Rm + hm)
  // Ambas son idénticas hasta el noveno decimal. Usamos (KelevA + KelevB) / 2 para consistencia estricta.
  const meanKElevation = (pointA.kElevation + pointB.kElevation) / 2;

  // Factor Combinado medio
  const meanKCombined = meanKScale * meanKElevation;

  // 3. Distancia Geodésica Lo = Lc / Kescala_medio
  const distGeodesic = distGrid / meanKScale;

  // 4. Distancia Topográfica Lt = Lo / Kelev_medio = Lc / Kcombinado_medio
  const distTopographic = distGeodesic / meanKElevation;

  return {
    alignmentName,
    pointA,
    pointB,
    deltaE,
    deltaN,
    distGrid,
    meanKScale,
    meanHeight,
    meanR,
    meanKElevation,
    meanKCombined,
    distGeodesic,
    distTopographic,
    diffGridVsTopo: distTopographic - distGrid,
    diffGeodVsTopo: distTopographic - distGeodesic,
  };
}

/** Inverse Transformation: UTM Coordinates to Geodesic (Lat, Lon) */
export function calculateUtmToGeodesic(
  pointName: string,
  east: number,
  north: number,
  zone: number,
  hemisphere: 'N' | 'S',
  datumKey: 'WGS84' | 'HAYFORD' | 'CUSTOM',
  customEllipsoid?: Ellipsoid
): UtmToGeodesicResult {
  const ellipsoid: Ellipsoid =
    datumKey === 'CUSTOM' && customEllipsoid
      ? customEllipsoid
      : ELLIPSOIDS[datumKey] || ELLIPSOIDS.WGS84;

  const k0 = ellipsoid.k0;
  const a = ellipsoid.a;
  const e2 = ellipsoid.e2;
  const ePrime2 = ellipsoid.ePrime2;

  // False Easting & Northing
  const x = east - 500000.0;
  const y = hemisphere === 'S' ? north - 10000000.0 : north;

  // Footprint latitude (latitud del pie de la perpendicular)
  // M = y / k0
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * Math.pow(e2, 2) / 64 - 5 * Math.pow(e2, 3) / 256));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const phi1 =
    mu +
    (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32) * Math.sin(2 * mu) +
    (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32) * Math.sin(4 * mu) +
    (151 * Math.pow(e1, 3) / 96) * Math.sin(6 * mu) +
    (1097 * Math.pow(e1, 4) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const C1 = ePrime2 * Math.pow(cosPhi1, 2);
  const T1 = Math.pow(tanPhi1, 2);
  const N1 = a / Math.sqrt(1 - e2 * Math.pow(sinPhi1, 2));
  const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.pow(sinPhi1, 2), 1.5);
  const D = x / (N1 * k0);

  // Latitude
  const latRad =
    phi1 -
    (N1 * tanPhi1 / R1) *
      (Math.pow(D, 2) / 2 -
        (5 + 3 * T1 + 10 * C1 - 4 * Math.pow(C1, 2) - 9 * ePrime2) * Math.pow(D, 4) / 24 +
        (61 + 90 * T1 + 298 * C1 + 45 * Math.pow(T1, 2) - 252 * ePrime2 - 3 * Math.pow(C1, 2)) *
          Math.pow(D, 6) /
          720);

  // Longitude
  const centralMeridianDeg = zone * 6 - 183;
  const lonRad =
    (D -
      (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6 +
      (5 - 2 * C1 + 28 * T1 - 3 * Math.pow(C1, 2) + 8 * ePrime2 + 24 * Math.pow(T1, 2)) *
        Math.pow(D, 5) /
        120) /
    cosPhi1;

  const latDecimal = (latRad * 180) / Math.PI;
  const lonDecimal = centralMeridianDeg + (lonRad * 180) / Math.PI;

  const latDms = decimalToDms(latDecimal, true);
  const lonDms = decimalToDms(lonDecimal, false);

  // Scale factor at the recovered point
  const X_abs = Math.abs(x);
  const q = 0.000001 * X_abs;
  const twoN2K02 = 2 * Math.pow(N1, 2) * Math.pow(k0, 2);
  const onePlusEprime2Cos2Phi = 1 + ePrime2 * Math.pow(Math.cos(latRad), 2);
  const P_factor = (onePlusEprime2Cos2Phi / twoN2K02) * 1e12;
  const kScale = k0 * (1 + P_factor * Math.pow(q, 2) + 0.00003 * Math.pow(q, 4));

  // Grid Convergence
  const convergenceMeridianDeg = (tanPhi1 * (x / N1) * 180) / Math.PI;

  return {
    pointName,
    east,
    north,
    zone,
    hemisphere,
    ellipsoid,
    footprintLatDeg: (phi1 * 180) / Math.PI,
    footprintLatRad: phi1,
    centralMeridianDeg,
    latDecimal,
    lonDecimal,
    latDms,
    lonDms,
    kScale,
    convergenceMeridianDeg,
  };
}

/** Built-in Presets directly matching the UNSA PDF documents */
export const UNSA_PRESETS: Record<string, PresetPoint> = {
  // Presets from PDF 1 & PDF 2 (Cálculo de Factores y Distancias)
  A8: {
    name: 'Punto A8 (PDF UNSA)',
    latDms: { degrees: 13, minutes: 22, seconds: 42.11, direction: 'S' as const },
    lonDms: { degrees: 73, minutes: 57, seconds: 6.61, direction: 'W' as const },
    east: 613495.358,
    north: 8520781.602,
    h: 3848.100,
    forcedZone: 18,
    cui: 'UNSA-A8',
  },
  P8: {
    name: 'Punto P8 (PDF UNSA)',
    latDms: { degrees: 13, minutes: 22, seconds: 23.37, direction: 'S' as const },
    lonDms: { degrees: 73, minutes: 56, seconds: 58.05, direction: 'W' as const },
    east: 613755.292,
    north: 8521356.277,
    h: 3820.242,
    forcedZone: 18,
    cui: 'UNSA-P8',
  },
  A7: {
    name: 'Punto A7 (PDF UNSA)',
    latDms: { degrees: 13, minutes: 22, seconds: 23.95, direction: 'S' as const },
    lonDms: { degrees: 73, minutes: 56, seconds: 42.11, direction: 'W' as const },
    east: 614234.716,
    north: 8521336.420,
    h: 3650.305,
    forcedZone: 18,
    cui: 'UNSA-A7',
  },
  P7: {
    name: 'Punto P7 (PDF UNSA)',
    latDms: { degrees: 13, minutes: 22, seconds: 21.61, direction: 'S' as const },
    lonDms: { degrees: 73, minutes: 56, seconds: 39.04, direction: 'W' as const },
    east: 614327.373,
    north: 8521407.920,
    h: 3612.033,
    forcedZone: 18,
    cui: 'UNSA-P7',
  },
  // Presets from PB62 (PDF 5, 6, 7)
  PB62_Z19: {
    name: 'PB62 - Zona 19 (CUI 19863613)',
    latDms: { degrees: 13, minutes: 25, seconds: 8.87, direction: 'S' as const },
    lonDms: { degrees: 71, minutes: 56, seconds: 22.56, direction: 'W' as const },
    forcedZone: 19,
    cui: '19863613',
  },
  PB62_Z18: {
    name: 'PB62 - Zona 18 (CUI 19863613)',
    latDms: { degrees: 13, minutes: 25, seconds: 8.87, direction: 'S' as const },
    lonDms: { degrees: 73, minutes: 56, seconds: 22.56, direction: 'W' as const },
    forcedZone: 18,
    cui: '19863613',
  },
  PB62_AREQUIPA: {
    name: 'PB62 - Arequipa (CUI 19863613)',
    latDms: { degrees: 16, minutes: 23, seconds: 56.00, direction: 'S' as const },
    lonDms: { degrees: 71, minutes: 32, seconds: 13.00, direction: 'W' as const },
    forcedZone: 19,
    cui: '19863613',
  },
};
