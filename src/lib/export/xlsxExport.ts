import ExcelJS from "exceljs";
import type { ExportModel } from "./buildExportRows";
import { ACCENT, EXPORT_FILL_BY_LABEL, ZEBRA_FILL } from "./fillColors";

const solidFill = (argbNoAlpha: string): ExcelJS.Fill => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: `FF${argbNoAlpha}` },
});

export async function buildXlsx(model: ExportModel): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Tabel", {
    pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    views: [{ state: "frozen", xSplit: 4, ySplit: 2 }],
  });

  const metaHeaders = [model.labels.num, model.labels.fullName, model.labels.position, model.labels.rate];
  const headerRow = ws.getRow(2);
  metaHeaders.forEach((h, i) => (headerRow.getCell(i + 1).value = h));
  model.days.forEach((d, i) => (headerRow.getCell(5 + i).value = d));

  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 26;
  ws.getColumn(3).width = 22;
  ws.getColumn(4).width = 8;
  model.days.forEach((_, i) => (ws.getColumn(5 + i).width = 4.5));

  const lastCol = 4 + model.days.length;
  ws.mergeCells(1, 1, 1, lastCol);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = model.titleLine;
  titleCell.font = { name: "Times New Roman", size: 16, bold: true, color: { argb: `FF${ACCENT}` } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  // Accent rule under the whole title, echoing the reference template's
  // title underline — every cell in the merged range needs the border, not
  // just the top-left one, for it to draw across the full width.
  for (let c = 1; c <= lastCol; c++) {
    ws.getCell(1, c).border = { bottom: ACCENT_RULE };
  }

  headerRow.eachCell((c) => {
    c.font = { name: "Times New Roman", size: 9, bold: true };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = { ...THIN_ALL, bottom: ACCENT_RULE };
  });

  model.rows.forEach((row, i) => {
    const r = ws.getRow(3 + i);
    const zebra = i % 2 === 1 ? ZEBRA_FILL : undefined;
    r.getCell(1).value = row.index;
    r.getCell(2).value = row.fullName;
    r.getCell(3).value = row.position;
    r.getCell(4).value = row.rateLabel;
    row.cells.forEach((cellData, di) => (r.getCell(5 + di).value = cellData.text));
    r.eachCell({ includeEmpty: true }, (c, colNumber) => {
      c.font = { name: "Times New Roman", size: 9 };
      c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? "left" : "center", vertical: "middle" };
      c.border = THIN_ALL;
      const dayCode = colNumber >= 5 ? row.cells[colNumber - 5]?.code : null;
      const fill = (dayCode && EXPORT_FILL_BY_LABEL[dayCode]) ?? zebra;
      if (fill) c.fill = solidFill(fill);
    });
  });

  let r = 3 + model.rows.length + 1;
  ws.mergeCells(r, 1, r, lastCol);
  ws.getCell(r, 1).value = {
    richText: [
      { font: { name: "Times New Roman", size: 9, bold: true, color: { argb: `FF${ACCENT}` } }, text: `${model.labels.legendTitle}  ` },
      ...model.legend.flatMap((l, i) => {
        const swatch = EXPORT_FILL_BY_LABEL[l.code] ?? "BFBFBF";
        return [
          { font: { name: "Times New Roman", size: 9, bold: true, color: { argb: `FF${swatch}` } }, text: `${i > 0 ? "    " : ""}■ ` },
          { font: { name: "Times New Roman", size: 9, bold: true, color: { argb: "FF404040" } }, text: l.label },
          { font: { name: "Times New Roman", size: 9, color: { argb: "FF595959" } }, text: ` — ${l.meaning}` },
        ];
      }),
    ],
  };
  r++;

  r++; // gap before the signature block
  for (let c = 1; c <= lastCol; c++) ws.getCell(r, c).border = { top: { style: "thin", color: GRID_COLOR } };
  r++;

  ws.getCell(r, 1).value = {
    richText: [
      { font: { name: "Times New Roman", size: 12, bold: true, color: { argb: `FF${ACCENT}` } }, text: `${model.labels.managerLabel}    ` },
      { font: { name: "Times New Roman", size: 12, bold: true }, text: model.managerName },
    ],
  };
  r++;
  ws.getCell(r, 1).value = {
    richText: [
      {
        font: { name: "Times New Roman", size: 12, bold: true, color: { argb: `FF${ACCENT}` } },
        text: `${model.labels.hrHeadLabel}    `,
      },
      { font: { name: "Times New Roman", size: 12, bold: true }, text: model.hrHeadName },
    ],
  };

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// Soft light-gray grid (Gantt-template style) instead of a heavy black grid.
const GRID_COLOR = { argb: "FFD9D9D9" };
const THIN_ALL: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: GRID_COLOR },
  bottom: { style: "thin", color: GRID_COLOR },
  left: { style: "thin", color: GRID_COLOR },
  right: { style: "thin", color: GRID_COLOR },
};
const ACCENT_RULE: ExcelJS.Border = { style: "medium", color: { argb: `FF${ACCENT}` } };
