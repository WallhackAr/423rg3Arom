import jsPDF from 'jspdf';
import {
  GeodesicToUtmResult,
  PointFactorsResult,
  DistanceAlignmentResult,
  UtmToGeodesicResult,
} from '../types/geodesy';

/** Helper to draw a university header */
function drawHeader(doc: jsPDF, title: string, subtitle: string, cui?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top header bar (UNSA Red / Burgundy)
  doc.setFillColor(123, 17, 19);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('FACULTAD DE INGENIERÍA CIVIL · GEODESIA SATELITAL', 14, 16);

  if (cui) {
    doc.setFont('helvetica', 'bold');
    doc.text(`CUI: ${cui}`, pageWidth - 14, 16, { align: 'right' });
  }

  // Gold accent bar
  doc.setFillColor(218, 165, 32);
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, 35);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const now = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`${subtitle} | Fecha: ${now}`, 14, 41);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 44, pageWidth - 14, 44);

  return 48; // starting Y
}

/** Helper to draw footer on each page */
function drawFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Sistema de Geodesia Satelital - Memoria de Cálculo Automatizada',
      14,
      pageHeight - 7
    );
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 7, {
      align: 'right',
    });
  }
}

/** Helper to add a table section */
function drawTable(
  doc: jsPDF,
  startY: number,
  title: string,
  headers: string[],
  rows: (string | number)[][],
  columnWidths?: number[]
): number {
  let y = startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidth = columnWidths || headers.map(() => (pageWidth - 28) / headers.length);

  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, y);
  y += 5;

  // Header row
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, pageWidth - 28, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let currentX = 14;
  headers.forEach((h, i) => {
    doc.text(h, currentX + 3, y + 4.8);
    currentX += colWidth[i];
  });
  y += 7;

  // Body rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  rows.forEach((row, rowIndex) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 6.5, 'S');

    currentX = 14;
    row.forEach((cell, cellIndex) => {
      const cellText = String(cell);
      doc.text(cellText, currentX + 3, y + 4.5);
      currentX += colWidth[cellIndex];
    });
    y += 6.5;
  });

  return y + 6;
}

/** 1. EXPORT PDF: Geodésicas a UTM */
export function exportGeodesicToUtmPdf(result: GeodesicToUtmResult) {
  const doc = new jsPDF();
  let y = drawHeader(
    doc,
    'TRANSFORMACIÓN DE COORDENADAS GEODÉSICAS A UTM',
    `Punto: ${result.pointName} · Datum: ${result.ellipsoid.name}`,
    result.cui
  );

  // Cuadro Resumen
  y = drawTable(
    doc,
    y,
    '1. CUADRO RESUMEN DE COORDENADAS Y FACTORES',
    ['Parámetro', 'Valor Simbólico', 'Resultado'],
    [
      ['Latitud Geodésica (φ)', 'φ', `${result.latDecimal.toFixed(8)}° (${result.latRadians.toFixed(9)} rad)`],
      ['Longitud Geodésica (λ)', 'λ', `${result.lonDecimal.toFixed(8)}° (${result.lonRadians.toFixed(9)} rad)`],
      ['Zona de Proyección UTM', 'P = truncar(λ/6 + 31)', `Zona ${result.zone}`],
      ['Meridiano Central (MC)', 'λo = P*6 - 183°', `${result.centralMeridianDeg}°`],
      ['Diferencia de Longitud (Δλ)', 'Δλ = λ - λo', `${result.deltaLonDeg.toFixed(8)}° (${result.deltaLonRad.toFixed(9)} rad)`],
      ['Coordenada Este UTM', 'E = 500 000 + 0.9996 * E\'', `${result.E_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`],
      ['Coordenada Norte UTM', 'N = 10 000 000 + 0.9996 * N\'', `${result.N_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`],
      ['Factor de Escala Puntual', 'Kescala', `${result.k_scale.toFixed(10)}`],
      ...(result.k_elevation
        ? [
            ['Altura Elipsoidal (h)', 'h', `${result.h?.toFixed(3)} m`],
            ['Factor de Elevación', 'Kelevación = R / (R + h)', `${result.k_elevation.toFixed(10)}`],
            ['Factor Combinado', 'Kcombinado = Kelev * Kescala', `${result.k_combined?.toFixed(10)}`],
          ]
        : []),
    ],
    [60, 50, 72]
  );

  // Parámetros del Elipsoide
  y = drawTable(
    doc,
    y,
    '2. CONSTANTES DEL ELIPSOIDE DE REFERENCIA',
    ['Parámetro', 'Símbolo', 'Fórmula / Definición', 'Valor'],
    [
      ['Semieje mayor', 'a', 'Radio ecuatorial', `${result.ellipsoid.a.toLocaleString('en-US', { minimumFractionDigits: 3 })} m`],
      ['Semieje menor', 'b', 'Radio polar', `${result.ellipsoid.b.toLocaleString('en-US', { minimumFractionDigits: 3 })} m`],
      ['1° Excentricidad²', 'e²', '(a² - b²) / a²', `${result.ellipsoid.e2.toFixed(9)}`],
      ['2° Excentricidad²', 'e\'²', '(a² - b²) / b²', `${result.ellipsoid.ePrime2.toFixed(9)}`],
      ['Radio polar de curvatura', 'c', 'a² / b', `${result.ellipsoid.c.toLocaleString('en-US', { minimumFractionDigits: 3 })} m`],
      ['Factor de Escala en MC', 'Ko', 'Constante UTM', `${result.ellipsoid.k0.toFixed(4)}`],
    ],
    [40, 25, 55, 62]
  );

  // Procedimiento Detallado con Fórmulas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. PROCEDIMIENTO DETALLADO DE CÁLCULO (MÉTODO UNSA)', 14, y);
  y += 5;

  const steps = [
    {
      title: 'A. Cálculo de la Zona UTM (P)',
      formula: 'P = truncar( λ / 6 + 31 )',
      subst: `P = truncar( ${result.lonDecimal.toFixed(6)} / 6 + 31 ) = truncar( ${result.zoneFormulaVal.toFixed(6)} )`,
      res: `Zona UTM P = ${result.zone}`,
    },
    {
      title: 'B. Cálculo del Meridiano Central (λo) y Δλ',
      formula: 'λo = P · 6 - 183°   ;   Δλ = λ - λo (rad)',
      subst: `λo = ${result.zone} · 6 - 183° = ${result.centralMeridianDeg}°  |  Δλ = ${result.lonDecimal.toFixed(6)}° - (${result.centralMeridianDeg}°) = ${result.deltaLonDeg.toFixed(6)}°`,
      res: `Δλ = ${result.deltaLonRad.toFixed(9)} rad`,
    },
    {
      title: 'C. Parámetros Angulares y Radio de la Gran Normal (N)',
      formula: 't = tan(φ)   |   η² = e\'² · cos²(φ)   |   N = a / √(1 - e² · sen²(φ))',
      subst: `t = tan(${result.latRadians.toFixed(6)}) = ${result.t.toFixed(9)}  |  η² = ${result.ellipsoid.ePrime2.toFixed(9)} · cos²(${result.latDecimal.toFixed(4)}°) = ${result.eta2.toFixed(9)}`,
      res: `N = ${result.N_radio.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`,
    },
    {
      title: 'D. Cálculo de la Coordenada Este (E)',
      formula: 'E\' = (Δλ·cosφ)·N + [(Δλ·cosφ)³·N·(1 - t² + η²)] / 6 + [(Δλ·cosφ)⁵·N·(5 - 18t² + t⁴)] / 120\nE = 500 000 + 0.9996 · E\'',
      subst: `Term 1: ${result.E_term1.toFixed(4)}  |  Term 2: ${result.E_term2.toFixed(4)}  |  Term 3: ${result.E_term3.toFixed(4)}  ->  E' = ${result.E_prime.toFixed(4)}`,
      res: `ESTE = 500 000 + 0.9996 · (${result.E_prime.toFixed(4)}) = ${result.E_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`,
    },
    {
      title: 'E. Cálculo de la Coordenada Norte (N)',
      formula: 'AM = a · (A0·φ - A2·sen(2φ) + A4·sen(4φ) - A6·sen(6φ))\nN\' = AM + [(Δλ·cosφ)²·N·t] / 2 + [(Δλ·cosφ)⁴·N·t·(5 - t² + 9η² + 4η⁴)] / 24\nNorte (Hemisferio Sur) = 10 000 000.00 + 0.9996 · N\'',
      subst: `A0 = ${result.A0.toFixed(9)}, A2 = ${result.A2.toFixed(9)}, A4 = ${result.A4.toExponential(5)}, A6 = ${result.A6.toExponential(5)}\nAM = ${result.AM.toFixed(3)} m  |  N' = ${result.N_prime.toFixed(3)} m`,
      res: `NORTE = 10 000 000 + 0.9996 · (${result.N_prime.toFixed(3)}) = ${result.N_final.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`,
    },
    {
      title: 'F. Cálculo del Factor de Escala (Kescala)',
      formula: 'X = |500 000 - ESTE|  ;  q = 10⁻⁶ · X  ;  P = [(1 + e\'²·cos²φ) / (2·N²·Ko²)] · 10¹²\nKescala = Ko · [1 + P·q² + 0.00003·q⁴]',
      subst: `X = ${result.X.toFixed(4)} m  |  q = ${result.q.toFixed(10)}  |  P = ${result.P_factor.toFixed(11)}\nP·q² = ${result.P_q2.toFixed(10)}  |  0.00003·q⁴ = ${result.q4_term.toExponential(6)}`,
      res: `Kescala = 0.9996 · [1 + ${result.P_q2.toFixed(10)} + ${result.q4_term.toExponential(6)}] = ${result.k_scale.toFixed(10)}`,
    },
  ];

  steps.forEach((st) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 26, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(st.title, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fórmula: ${st.formula}`, 18, y + 10);
    doc.text(`Sustitución: ${st.subst}`, 18, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text(`Resultado: ${st.res}`, 18, y + 22);

    y += 29;
  });

  drawFooter(doc);
  doc.save(`Calculo_UTM_${result.pointName}_${result.zone}.pdf`);
}

/** 2. EXPORT PDF: Factores de Reducción en un Punto */
export function exportPointFactorsPdf(result: PointFactorsResult) {
  const doc = new jsPDF();
  let y = drawHeader(
    doc,
    'CÁLCULO DE FACTORES GEODÉSICOS EN UN PUNTO',
    `Punto: ${result.pointName} · Datum: ${result.datum}`,
    result.pointName
  );

  // Cuadro Resumen de Factores (exactamente idéntico a las diapositivas de la UNSA)
  y = drawTable(
    doc,
    y,
    '1. CUADRO RESUMEN DE FACTORES (FORMATO OFICIAL UNSA)',
    ['N (Gran Normal)', '2 · N² · Ko²', 'e\'²', '1 + e\'² · cos²φ', 'P'],
    [
      [
        result.N.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        result.twoN2K02.toExponential(9).toUpperCase(),
        result.ePrime2.toFixed(9),
        result.onePlusEprime2Cos2Phi.toFixed(10),
        result.P.toFixed(11),
      ],
    ],
    [38, 42, 32, 42, 28]
  );

  y = drawTable(
    doc,
    y - 2,
    '',
    ['X', 'q', 'P · q²', '0.00003 · q⁴', 'Kescala'],
    [
      [
        result.X.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        result.q.toFixed(10),
        result.Pq2.toFixed(10),
        result.q4Term.toExponential(8).toUpperCase(),
        result.kScale.toFixed(10),
      ],
    ],
    [38, 42, 32, 42, 28]
  );

  y = drawTable(
    doc,
    y - 2,
    '',
    ['R (Radio Medio)', 'Altura h', 'Kelevación', 'Kcombinado', 'Status'],
    [
      [
        result.R.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        `${result.h.toFixed(3)} m`,
        result.kElevation.toFixed(10),
        result.kCombined.toFixed(10),
        'CALCULADO',
      ],
    ],
    [38, 42, 32, 42, 28]
  );

  // Procedimiento Detallado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. PROCEDIMIENTO DETALLADO PASO A PASO', 14, y);
  y += 5;

  const steps = [
    {
      title: 'A. Radio de Curvatura de la Gran Normal (N) y 2·N²·Ko²',
      formula: 'N = a / √(1 - e² · sen²φ)   ;   Denominador = 2 · N² · Ko²',
      subst: `N = ${result.a} / √(1 - ${result.e2} · sen²(${result.latDecimal.toFixed(6)}°))\n2 · (${result.N.toFixed(3)})² · (0.9996)² = ${result.twoN2K02.toExponential(10)}`,
      res: `N = ${result.N.toFixed(3)} m   |   2·N²·Ko² = ${result.twoN2K02.toExponential(9)}`,
    },
    {
      title: 'B. Coeficiente P del Punto',
      formula: 'P = [(1 + e\'² · cos²φ) / (2 · N² · Ko²)] · 10¹²',
      subst: `P = [ (1 + ${result.ePrime2.toFixed(9)} · cos²(${result.latDecimal.toFixed(6)}°)) / (${result.twoN2K02.toExponential(9)}) ] · 10¹²`,
      res: `P = ${result.P.toFixed(11)}`,
    },
    {
      title: 'C. Desplazamiento respecto al MC (X) y Factor q',
      formula: 'X = |500 000 - ESTE|   ;   q = 0.000001 · X',
      subst: `X = |500 000 - ${result.east.toFixed(3)}| = ${result.X.toFixed(3)} m\nq = 0.000001 · ${result.X.toFixed(3)} = ${result.q.toFixed(10)}`,
      res: `X = ${result.X.toFixed(3)} m   |   q = ${result.q.toFixed(10)}`,
    },
    {
      title: 'D. Factor de Escala Puntual (Kescala)',
      formula: 'Kescala = Ko · [1 + P · q² + 0.00003 · q⁴]',
      subst: `P · q² = ${result.Pq2.toFixed(10)}  |  0.00003 · q⁴ = ${result.q4Term.toExponential(8)}\nKescala = 0.9996 · [1 + ${result.Pq2.toFixed(10)} + ${result.q4Term.toExponential(8)}]`,
      res: `Kescala = ${result.kScale.toFixed(10)}`,
    },
    {
      title: 'E. Factor de Elevación (Kelevación)',
      formula: 'R = √(ρ · N)   ;   Kelevación = R / (R + h)',
      subst: `R = √(${result.rho.toFixed(3)} · ${result.N.toFixed(3)}) = ${result.R.toFixed(3)} m\nKelevación = ${result.R.toFixed(3)} / (${result.R.toFixed(3)} + ${result.h.toFixed(3)})`,
      res: `Kelevación = ${result.kElevation.toFixed(10)}`,
    },
    {
      title: 'F. Factor Combinado (Kcombinado)',
      formula: 'Kcombinado = Kelevación · Kescala',
      subst: `Kcombinado = ${result.kElevation.toFixed(10)} · ${result.kScale.toFixed(10)}`,
      res: `Kcombinado = ${result.kCombined.toFixed(10)}`,
    },
  ];

  steps.forEach((st) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 25, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(st.title, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fórmula: ${st.formula}`, 18, y + 10);
    doc.text(`Sustitución: ${st.subst}`, 18, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text(`Resultado: ${st.res}`, 18, y + 21);

    y += 28;
  });

  drawFooter(doc);
  doc.save(`Factores_Punto_${result.pointName}.pdf`);
}

/** 3. EXPORT PDF: Alineamiento y Cálculo de Distancias */
export function exportDistancesPdf(alignment: DistanceAlignmentResult) {
  const doc = new jsPDF();
  let y = drawHeader(
    doc,
    'CÁLCULO Y REDUCCIÓN DE DISTANCIAS GEODÉSICAS',
    `Alineamiento: ${alignment.alignmentName} (${alignment.pointA.pointName} -> ${alignment.pointB.pointName})`,
    'UNSA'
  );

  // Cuadro Resumen de Distancias (exacto al PDF 1 y 2 de la UNSA)
  y = drawTable(
    doc,
    y,
    '1. CUADRO RESUMEN DE DISTANCIAS',
    ['Alineamiento', 'Distancia Geodésica (Lo)', 'Distancia Cuadrícula (Lc)', 'Distancia Topográfica (Lt)', 'Δ (Lt - Lc)'],
    [
      [
        alignment.alignmentName,
        `${alignment.distGeodesic.toFixed(3)} m`,
        `${alignment.distGrid.toFixed(3)} m`,
        `${alignment.distTopographic.toFixed(3)} m`,
        `+${alignment.diffGridVsTopo.toFixed(3)} m`,
      ],
    ],
    [35, 40, 40, 42, 25]
  );

  // Cuadro de Coordenadas de los Puntos Extremos
  y = drawTable(
    doc,
    y,
    '2. COORDENADAS Y FACTORES DE LOS PUNTOS EXTREMOS',
    ['Punto', 'Este (m)', 'Norte (m)', 'h elipsoidal (m)', 'Kescala', 'Kelevación', 'Kcombinado'],
    [
      [
        alignment.pointA.pointName,
        alignment.pointA.east.toFixed(3),
        alignment.pointA.north.toFixed(3),
        alignment.pointA.h.toFixed(3),
        alignment.pointA.kScale.toFixed(10),
        alignment.pointA.kElevation.toFixed(10),
        alignment.pointA.kCombined.toFixed(10),
      ],
      [
        alignment.pointB.pointName,
        alignment.pointB.east.toFixed(3),
        alignment.pointB.north.toFixed(3),
        alignment.pointB.h.toFixed(3),
        alignment.pointB.kScale.toFixed(10),
        alignment.pointB.kElevation.toFixed(10),
        alignment.pointB.kCombined.toFixed(10),
      ],
    ],
    [24, 27, 27, 24, 28, 28, 24]
  );

  // Factores Medios de la Línea
  y = drawTable(
    doc,
    y,
    '3. FACTORES MEDIOS APLICADOS A LA LÍNEA',
    ['Factor', 'Fórmula', 'Valor'],
    [
      ['Factor de Escala Medio (Kescala)', '(Ka + Kb) / 2', alignment.meanKScale.toFixed(10)],
      ['Factor de Elevación Medio (Kelev)', '(KelevA + KelevB) / 2', alignment.meanKElevation.toFixed(10)],
      ['Factor Combinado Medio (Kcomb)', 'Kescala_m · Kelev_m', alignment.meanKCombined.toFixed(10)],
      ['Altura Elipsoidal Media (hm)', '(ha + hb) / 2', `${alignment.meanHeight.toFixed(3)} m`],
      ['Radio Medio (Rm)', '(Ra + Rb) / 2', `${alignment.meanR.toFixed(3)} m`],
    ],
    [60, 50, 72]
  );

  // Procedimiento Detallado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. PROCEDIMIENTO DETALLADO DE REDUCCIÓN DE DISTANCIAS', 14, y);
  y += 5;

  const steps = [
    {
      title: 'A. Distancia de Cuadrícula (Lc)',
      formula: 'Lc = √[ (EB - EA)² + (NB - NA)² ]',
      subst: `Lc = √[ (${alignment.pointB.east.toFixed(3)} - ${alignment.pointA.east.toFixed(3)})² + (${alignment.pointB.north.toFixed(3)} - ${alignment.pointA.north.toFixed(3)})² ]\nΔE = ${alignment.deltaE.toFixed(3)} m  |  ΔN = ${alignment.deltaN.toFixed(3)} m`,
      res: `Lc = ${alignment.distGrid.toFixed(3)} m`,
    },
    {
      title: 'B. Distancia Geodésica en el Elipsoide (Lo)',
      formula: 'Lo = Lc / Kescala_promedio',
      subst: `Lo = ${alignment.distGrid.toFixed(3)} / ${alignment.meanKScale.toFixed(10)}`,
      res: `Lo = ${alignment.distGeodesic.toFixed(3)} m`,
    },
    {
      title: 'C. Distancia Topográfica o de Terreno (Lt)',
      formula: 'Lt = Lo / Kelevación_promedio = Lc / Kcombinado_promedio',
      subst: `Lt = ${alignment.distGeodesic.toFixed(3)} / ${alignment.meanKElevation.toFixed(10)} = ${alignment.distGrid.toFixed(3)} / ${alignment.meanKCombined.toFixed(10)}`,
      res: `Lt = ${alignment.distTopographic.toFixed(3)} m`,
    },
  ];

  steps.forEach((st) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 23, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(st.title, 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Fórmula: ${st.formula}`, 18, y + 10);
    doc.text(`Sustitución: ${st.subst}`, 18, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text(`Resultado: ${st.res}`, 18, y + 19);

    y += 26;
  });

  drawFooter(doc);
  doc.save(`Alineamiento_${alignment.alignmentName}.pdf`);
}

/** 4. EXPORT PDF: UTM a Geodésicas (Inversa) */
export function exportUtmToGeodesicPdf(result: UtmToGeodesicResult) {
  const doc = new jsPDF();
  let y = drawHeader(
    doc,
    'TRANSFORMACIÓN INVERSA: UTM A COORDENADAS GEODÉSICAS',
    `Punto: ${result.pointName} · Zona ${result.zone} (${result.hemisphere}) · Datum: ${result.ellipsoid.name}`,
    result.pointName
  );

  y = drawTable(
    doc,
    y,
    '1. CUADRO RESUMEN DE COORDENADAS RECUPERADAS',
    ['Parámetro', 'Notación', 'Valor Sexagesimal', 'Valor Decimal'],
    [
      ['Latitud Geodésica (φ)', 'φ', `${result.latDms.degrees}° ${result.latDms.minutes}' ${result.latDms.seconds.toFixed(4)}" ${result.latDms.direction}`, `${result.latDecimal.toFixed(9)}°`],
      ['Longitud Geodésica (λ)', 'λ', `${result.lonDms.degrees}° ${result.lonDms.minutes}' ${result.lonDms.seconds.toFixed(4)}" ${result.lonDms.direction}`, `${result.lonDecimal.toFixed(9)}°`],
      ['Coordenada Este UTM', 'E', `${result.east.toFixed(3)} m`, `${result.east.toFixed(3)} m`],
      ['Coordenada Norte UTM', 'N', `${result.north.toFixed(3)} m`, `${result.north.toFixed(3)} m`],
      ['Zona y Hemisferio', 'UTM', `Zona ${result.zone}`, result.hemisphere === 'S' ? 'Hemisferio Sur' : 'Hemisferio Norte'],
      ['Meridiano Central', 'λo', `${result.centralMeridianDeg}°`, `${result.centralMeridianDeg}.000000°`],
      ['Factor de Escala Local', 'K', `${result.kScale.toFixed(10)}`, `${result.kScale.toFixed(10)}`],
      ['Convergencia de Meridianos', 'γ', `${result.convergenceMeridianDeg.toFixed(6)}°`, `${result.convergenceMeridianDeg.toFixed(6)}°`],
    ],
    [45, 25, 60, 52]
  );

  drawFooter(doc);
  doc.save(`Inversa_UTM_${result.pointName}.pdf`);
}
