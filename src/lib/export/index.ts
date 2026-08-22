import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { buildExportRows, type ExportInput } from "./buildExportRows";
import { buildDocx } from "./docxExport";
import { buildXlsx } from "./xlsxExport";
import { monthName } from "../i18n/translations";
import { useToastStore } from "../../state/toastStore";
import { t } from "../i18n/t";

function fileBaseName(input: ExportInput): string {
  const safeDept = input.department.name.trim().replace(/[\\/:*?"<>|]+/g, "_").slice(0, 60);
  return `Tabel_${safeDept}_${monthName(input.month, input.locale)}_${input.year}`;
}

function notifySaved(path: string) {
  useToastStore.getState().showSuccess(t("common.fileSaved"), {
    label: t("common.openFolder"),
    onClick: () => {
      void revealItemInDir(path);
    },
  });
}

async function saveBlob(blob: Blob, defaultPath: string, extensions: string[], filterName: string): Promise<string | null> {
  const path = await save({ defaultPath, filters: [{ name: filterName, extensions }] });
  if (!path) return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await writeFile(path, bytes);
  return path;
}

export async function exportDocx(input: ExportInput): Promise<void> {
  const model = buildExportRows(input);
  const blob = await buildDocx(model);
  const path = await saveBlob(blob, `${fileBaseName(input)}.docx`, ["docx"], "Word");
  if (path) notifySaved(path);
}

export async function exportXlsx(input: ExportInput): Promise<void> {
  const model = buildExportRows(input);
  const blob = await buildXlsx(model);
  const path = await saveBlob(blob, `${fileBaseName(input)}.xlsx`, ["xlsx"], "Excel");
  if (path) notifySaved(path);
}

export { buildExportRows };
