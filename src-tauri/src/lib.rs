use tauri_plugin_sql::{Migration, MigrationKind};

// window.print() from JS is unreliable in Tauri's macOS WKWebView, so we
// print through Tauri's native Rust-side WebviewWindow::print() instead,
// which is documented and supported specifically on macOS.
//
// wry's print() always launches with NSPrintInfo.sharedPrintInfo(), which
// ignores our @page { size: landscape } CSS and defaults to portrait. We
// flip the shared print info to landscape ourselves right before printing —
// wry reads that same shared instance, so this is picked up automatically.
#[cfg(target_os = "macos")]
fn force_landscape_print_orientation() {
    use objc2_app_kit::{NSPaperOrientation, NSPrintInfo};
    let print_info = NSPrintInfo::sharedPrintInfo();
    print_info.setOrientation(NSPaperOrientation::Landscape);
}

#[tauri::command]
fn print_window(window: tauri::WebviewWindow) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    force_landscape_print_orientation();
    window.print().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "init",
            sql: include_str!("../migrations/0001_init.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "soft_delete_employees",
            sql: include_str!("../migrations/0002_soft_delete_employees.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:tabel.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![print_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
