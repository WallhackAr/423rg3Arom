/**
 * Geodesy Satelital - UNSA
 * Core Types and Definitions
 */

export interface Ellipsoid {
  name: string;
  a: number; // Semieje mayor (m)
  b: number; // Semieje menor (m)
  f: number; // Achatamiento (1/f)
  e2: number; // Cuadrado de la 1° excentricidad
  ePrime2: number; // Cuadrado de la 2° excentricidad
  c: number; // Radio polar de curvatura (m)
  k0: number; // Factor de escala en el meridiano central (0.9996)
}

export const ELLIPSOIDS: Record<string, Ellipsoid> = {
  WGS84: {
    name: 'WGS 84 (GPS Global)',
    a: 6378137.000,
    b: 6356752.314,
    f: 298.257223563,
    e2: 0.006694380,
    ePrime2: 0.006739497,
    c: 6399593.626,
    k0: 0.9996,
  },
  HAYFORD: {
    name: 'Hayford / Internacional 1924 (PSAD56)',
    a: 6378388.000,
    b: 6356911.946,
    f: 297.0,
    e2: 0.006722670,
    ePrime2: 0.006768170,
    c: 6399936.608,
    k0: 0.9996,
  },
};

export interface DMSCoordinate {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

export interface GeodesicInput {
  latDms: DMSCoordinate;
  lonDms: DMSCoordinate;
  ellipsoidKey: 'WGS84' | 'HAYFORD' | 'CUSTOM';
  customEllipsoid?: Ellipsoid;
  forcedZone?: number | null; // null for auto
  h?: number; // Altura elipsoidal (m)
  cui?: string; // Código de estudiante
  pointName?: string;
}

export interface GeodesicToUtmResult {
  // Inputs
  pointName: string;
  cui?: string;
  ellipsoid: Ellipsoid;
  latDecimal: number;
  lonDecimal: number;
  latRadians: number;
  lonRadians: number;
  
  // Step A & B: Zone & Central Meridian
  zone: number;
  zoneFormulaVal: number;
  centralMeridianDeg: number;
  centralMeridianRad: number;
  deltaLonDeg: number;
  deltaLonRad: number; // Δλ
  
  // Step C: Auxiliary parameters
  t: number; // tan(φ)
  eta2: number; // e'^2 * cos^2(φ)
  N_radio: number; // Radio de la Gran Normal N
  
  // Step D: East Calculation
  E_prime: number;
  E_term1: number;
  E_term2: number;
  E_term3: number;
  E_final: number; // Este UTM
  
  // Step E: North Calculation
  A0: number;
  A2: number;
  A4: number;
  A6: number;
  AM: number; // Arco de meridiano
  N_prime: number;
  N_term1: number;
  N_term2: number;
  N_term3: number;
  isSouthHemisphere: boolean;
  N_final: number; // Norte UTM
  
  // Scale Factor for the point
  X: number; // |500,000 - E|
  q: number; // 0.000001 * X
  twoN2K02: number; // 2 * N^2 * Ko^2
  onePlusEprime2Cos2Phi: number; // 1 + e'^2 * cos^2(φ)
  P_factor: number; // P
  P_q2: number; // P * q^2
  q4_term: number; // 0.00003 * q^4
  k_scale: number; // Kescala
  
  // Elevation & Combined factor if h is provided
  h?: number;
  rho_radio?: number; // Radio de curvatura del meridiano ρ
  R_mean?: number; // Radio medio r = sqrt(ρ * N)
  k_elevation?: number; // Kelevación = R / (R + h)
  k_combined?: number; // Kcombinado = Kelev * Kescala
}

export interface PointFactorsResult {
  pointName: string;
  datum: string;
  latDecimal: number;
  lonDecimal?: number;
  latDmsStr: string;
  lonDmsStr?: string;
  east: number;
  north: number;
  h: number;
  
  // Ellipsoid values
  a: number;
  b: number;
  e2: number;
  ePrime2: number;
  c: number;
  k0: number;
  
  // Radii
  N: number;
  rho: number;
  R: number; // Radio medio sqrt(ρ * N)
  
  // Grid factor terms
  twoN2K02: number;
  onePlusEprime2Cos2Phi: number;
  P: number;
  X: number;
  q: number;
  Pq2: number;
  q4Term: number;
  kScale: number;
  
  // Elevation factor
  kElevation: number;
  
  // Combined factor
  kCombined: number;
}

export interface DistanceAlignmentResult {
  alignmentName: string;
  pointA: PointFactorsResult;
  pointB: PointFactorsResult;
  
  // 1. Grid Distance (Lc)
  deltaE: number;
  deltaN: number;
  distGrid: number; // Lc = sqrt(ΔE^2 + ΔN^2)
  
  // 2. Mean Factors
  meanKScale: number; // (Ka + Kb) / 2
  meanHeight: number; // (ha + hb) / 2
  meanR: number; // (Ra + Rb) / 2
  meanKElevation: number; // Rm / (Rm + hm) or (KelevA + KelevB)/2
  meanKCombined: number; // Kscale_mean * Kelev_mean
  
  // 3. Geodesic Distance (Lo)
  distGeodesic: number; // Lo = Lc / meanKScale
  
  // 4. Topographic Distance (Lt)
  distTopographic: number; // Lt = Lo / meanKElevation = Lc / meanKCombined
  
  // Differences
  diffGridVsTopo: number; // Lt - Lc
  diffGeodVsTopo: number; // Lt - Lo
}
