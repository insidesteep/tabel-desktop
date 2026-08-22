import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePrintStore } from "../../state/printStore";
import { ACCENT, EXPORT_FILL_BY_LABEL } from "../../lib/export/fillColors";
import { META_WIDTHS, dayColumnWidths } from "../../lib/export/columnWidths";
import { reportError } from "../../state/toastStore";
import { t } from "../../lib/i18n/t";

/**
 * Invisible in normal use; becomes visible only inside @media print (see
 * index.css) while a model is set, replacing the whole page with a
 * print-ready A4-landscape table. Triggers the OS print dialog through
 * Tauri's native Rust-side print command — plain JS window.print() is
 * unreliable inside Tauri's macOS WKWebView.
 *
 * Mirrors docxExport.ts's design exactly (same accent color, same fill
 * palette, same twip-based column proportions via columnWidths.ts) so a
 * printed page and the exported Word file never look different.
 */
export function PrintTimesheet() {
  const model = usePrintStore((s) => s.model);

  // Deliberately never cleared automatically: the native print sheet reads
  // the webview's live DOM while it's open, and we have no reliable signal
  // for "the user is done with the print dialog" on this path (unlike
  // window.print()'s `afterprint` event). #print-root stays invisible
  // on-screen the rest of the time (see the @media print rule in index.css),
  // so leaving the last-printed model in place between prints is harmless —
  // the next print click just replaces it before printing again.
  useEffect(() => {
    if (!model) return;
    const timer = window.setTimeout(() => {
      invoke("print_window").catch((err) => reportError(t("common.printDialogError"), err));
    }, 100);
    return () => window.clearTimeout(timer);
  }, [model]);

  if (!model) return null;

  const dayWidths = dayColumnWidths(model.days.length);
  const totalWidth = META_WIDTHS.num + META_WIDTHS.name + META_WIDTHS.position + META_WIDTHS.rate + dayWidths.reduce((a, b) => a + b, 0);
  const pct = (w: number) => `${(w / totalWidth) * 100}%`;

  return (
    <div id="print-root">
      <div className="print-title">{model.titleLine}</div>
      <table className="print-table">
        <colgroup>
          <col style={{ width: pct(META_WIDTHS.num) }} />
          <col style={{ width: pct(META_WIDTHS.name) }} />
          <col style={{ width: pct(META_WIDTHS.position) }} />
          <col style={{ width: pct(META_WIDTHS.rate) }} />
          {model.days.map((d, i) => (
            <col key={d} style={{ width: pct(dayWidths[i]) }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th>{model.labels.num}</th>
            <th className="print-left">{model.labels.fullName}</th>
            <th className="print-left">{model.labels.position}</th>
            <th>{model.labels.rate}</th>
            {model.days.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {model.rows.map((row) => (
            <tr key={row.index}>
              <td>{row.index}</td>
              <td className="print-left">{row.fullName}</td>
              <td className="print-left">{row.position}</td>
              <td>{row.rateLabel}</td>
              {row.cells.map((c, i) => (
                <td key={i} style={{ background: c.code ? `#${EXPORT_FILL_BY_LABEL[c.code]}` : undefined }}>
                  {c.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="print-legend">
        <span className="print-legend-title">{model.labels.legendTitle}</span>
        {model.legend.map((l) => (
          <span key={l.code} className="print-legend-item">
            <span className="print-swatch" style={{ background: `#${EXPORT_FILL_BY_LABEL[l.code]}` }} />
            <b>{l.label}</b> — {l.meaning}
          </span>
        ))}
      </div>
      <div className="print-signature">
        <span className="print-signature-label" style={{ color: `#${ACCENT}` }}>
          {model.labels.managerLabel}
        </span>
        &nbsp;&nbsp;&nbsp;&nbsp;{model.managerName}
      </div>
      <div className="print-signature">
        <span className="print-signature-label" style={{ color: `#${ACCENT}` }}>
          {model.labels.hrHeadLabel}
        </span>
        &nbsp;&nbsp;&nbsp;&nbsp;{model.hrHeadName}
      </div>
    </div>
  );
}
