import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { ExportModel } from "./buildExportRows";
import { ACCENT, EXPORT_FILL_BY_LABEL, ZEBRA_FILL } from "./fillColors";
import { META_WIDTHS, dayColumnWidths } from "./columnWidths";

// Every measurement below (page size/margins, table width, column widths,
// borders, row heights, fonts, and the Sunday/M-T cell fill colors) was read
// directly out of the real template's word/document.xml, not guessed —
// see the "table grid / borders / shading" inspection this was built from.

const PAGE_WIDTH = 16838;
const PAGE_HEIGHT = 11906;
const MARGIN = { top: 709, right: 1134, bottom: 1134, left: 1134 };

const HEADER_ROW_HEIGHT = 542;
const DATA_ROW_HEIGHT = 358;
const CELL_FONT_SIZE = 16; // 8pt, matches the template exactly
const TITLE_FONT_SIZE = 24; // 12pt, also the document's default run size
const TITLE_DISPLAY_SIZE = 32; // 16pt, just for the big title line itself
const LEGEND_FONT_SIZE = 15; // 7.5pt — small, single-row legend

// Soft light-gray grid (Gantt-template style) instead of a heavy black grid;
// the header row gets its own thicker accent-colored underline instead of a
// solid fill block, echoing the reference template's title rule.
const GRID_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" };
const CELL_BORDERS = { top: GRID_BORDER, bottom: GRID_BORDER, left: GRID_BORDER, right: GRID_BORDER };
const HEADER_BOTTOM_BORDER = { style: BorderStyle.SINGLE, size: 16, color: ACCENT };
const HEADER_BORDERS = { ...CELL_BORDERS, bottom: HEADER_BOTTOM_BORDER };
const CELL_MARGINS = { top: 0, bottom: 0, left: 108, right: 108 };

function cell(
  text: string,
  opts: {
    width: number;
    bold?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    fill?: string;
    color?: string;
    borders?: typeof CELL_BORDERS;
  },
) {
  return new TableCell({
    width: { size: opts.width, type: WidthType.DXA },
    borders: opts.borders ?? CELL_BORDERS,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGINS,
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.CENTER,
        children: [new TextRun({ text, bold: opts.bold, size: CELL_FONT_SIZE, color: opts.color })],
      }),
    ],
  });
}

export async function buildDocx(model: ExportModel): Promise<Blob> {
  const dayWidths = dayColumnWidths(model.days.length);
  const columnWidths = [META_WIDTHS.num, META_WIDTHS.name, META_WIDTHS.position, META_WIDTHS.rate, ...dayWidths];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

  const headerCell = (text: string, width: number) =>
    cell(text, { width, bold: true, borders: HEADER_BORDERS });

  const headerRow = new TableRow({
    tableHeader: true,
    height: { value: HEADER_ROW_HEIGHT, rule: HeightRule.ATLEAST },
    children: [
      headerCell(model.labels.num, META_WIDTHS.num),
      headerCell(model.labels.fullName, META_WIDTHS.name),
      headerCell(model.labels.position, META_WIDTHS.position),
      headerCell(model.labels.rate, META_WIDTHS.rate),
      ...model.days.map((d, i) => headerCell(String(d), dayWidths[i])),
    ],
  });

  const dataRows = model.rows.map((row, i) => {
    const zebra = i % 2 === 1 ? ZEBRA_FILL : undefined;
    return new TableRow({
      height: { value: DATA_ROW_HEIGHT, rule: HeightRule.ATLEAST },
      children: [
        cell(String(row.index), { width: META_WIDTHS.num, bold: true, fill: zebra }),
        cell(row.fullName, { width: META_WIDTHS.name, fill: zebra }),
        cell(row.position, { width: META_WIDTHS.position, fill: zebra }),
        cell(row.rateLabel, { width: META_WIDTHS.rate, bold: true, fill: zebra }),
        ...row.cells.map((c, i2) =>
          cell(c.text, { width: dayWidths[i2], bold: true, fill: (c.code && EXPORT_FILL_BY_LABEL[c.code]) ?? zebra }),
        ),
      ],
    });
  });

  const table = new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Times New Roman", size: TITLE_FONT_SIZE } } } },
    sections: [
      {
        properties: {
          page: {
            // docx swaps width/height itself when orientation is LANDSCAPE
            // (it expects the *portrait* dimensions here), so pass them
            // pre-swapped to land on the real page size (16838x11906).
            size: { orientation: PageOrientation.LANDSCAPE, width: PAGE_HEIGHT, height: PAGE_WIDTH },
            margin: MARGIN,
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 24, color: ACCENT, space: 6 } },
            children: [new TextRun({ text: model.titleLine, bold: true, size: TITLE_DISPLAY_SIZE, color: ACCENT })],
          }),
          new Paragraph({ spacing: { after: 0 }, children: [] }),
          table,
          new Paragraph({
            spacing: { before: 200, after: 160 },
            children: [
              new TextRun({ text: `${model.labels.legendTitle}  `, bold: true, color: ACCENT, size: LEGEND_FONT_SIZE }),
              ...model.legend.flatMap((l, i) => {
                const swatch = EXPORT_FILL_BY_LABEL[l.code] ?? "BFBFBF";
                return [
                  new TextRun({ text: `${i > 0 ? "    " : ""}■ `, bold: true, color: swatch, size: LEGEND_FONT_SIZE }),
                  new TextRun({ text: l.label, bold: true, color: "404040", size: LEGEND_FONT_SIZE }),
                  new TextRun({ text: ` — ${l.meaning}`, color: "595959", size: LEGEND_FONT_SIZE }),
                ];
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 260, after: 0 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9", space: 4 } },
            children: [],
          }),
          new Paragraph({
            spacing: { before: 220 },
            children: [
              new TextRun({ text: `${model.labels.managerLabel}    `, bold: true, color: ACCENT }),
              new TextRun({ text: model.managerName, bold: true }),
            ],
          }),
          new Paragraph({
            spacing: { before: 160 },
            children: [
              new TextRun({ text: `${model.labels.hrHeadLabel}    `, bold: true, color: ACCENT }),
              new TextRun({ text: model.hrHeadName, bold: true }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
