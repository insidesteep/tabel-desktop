import type { Locale } from "../../state/localeStore";
import type { DayCode } from "../timesheet/types";

// UI strings, plus the export.* labels used by the generated Word/Excel/print
// documents — those now follow the app's display language too. The day-type
// codes themselves (Ya, M/T, O'z/h, K/v, B) stay fixed always, in every
// locale: they're the compact official abbreviations printed on the real
// government form's narrow table columns, not prose that can be translated.
const dict = {
  "app.title": { uz: "BSMI Tabeli", ru: "BSMI Табель" },
  "app.subtitle": { uz: "Bo'limlar va xodimlar ish vaqti hisobi", ru: "Отделы и учёт рабочего времени сотрудников" },

  "common.back": { uz: "Orqaga", ru: "Назад" },
  "common.cancel": { uz: "Bekor qilish", ru: "Отмена" },
  "common.create": { uz: "Yaratish", ru: "Создать" },
  "common.delete": { uz: "O'chirish", ru: "Удалить" },
  "common.close": { uz: "Yopish", ru: "Закрыть" },
  "common.excel": { uz: "Excel", ru: "Excel" },
  "common.word": { uz: "Word", ru: "Word" },
  "common.print": { uz: "Chop etish", ru: "Печать" },
  "common.exportError": { uz: "Faylni eksport qilib bo'lmadi", ru: "Не удалось экспортировать файл" },
  "common.printError": { uz: "Tabelni chop etishga tayyorlab bo'lmadi", ru: "Не удалось подготовить табель к печати" },
  "common.printDialogError": { uz: "Chop etish oynasini ochib bo'lmadi", ru: "Не удалось открыть диалог печати" },
  "common.openMonthError": { uz: "Oyni ochib bo'lmadi", ru: "Не удалось открыть месяц" },
  "common.saveError": { uz: "Saqlab bo'lmadi", ru: "Не удалось сохранить" },
  "common.fileSaved": { uz: "Fayl saqlandi", ru: "Файл сохранён" },
  "common.openFolder": { uz: "Papkani ochish", ru: "Открыть папку" },

  "departments.newDepartment": { uz: "Yangi bo'lim", ru: "Новый отдел" },
  "departments.emptyTitle": { uz: "Hozircha bo'limlar yo'q", ru: "Пока нет отделов" },
  "departments.emptyDescription": {
    uz: "Ish vaqti tabelini yuritishni boshlash uchun birinchi bo'limni yarating.",
    ru: "Создайте первый отдел, чтобы начать вести табель учёта рабочего времени.",
  },
  "departments.createDepartment": { uz: "Bo'lim yaratish", ru: "Создать отдел" },
  "departments.deleteConfirmTitle": { uz: "Bo'limni o'chirasizmi?", ru: "Удалить отдел?" },
  "departments.deleteConfirmDescription": {
    uz: "«{name}» va uning barcha tabellari butunlay o'chiriladi.",
    ru: "«{name}» и все его табели будут удалены безвозвратно.",
  },
  "departments.deleteAria": { uz: "Bo'limni o'chirish", ru: "Удалить отдел" },
  "departments.hrHeadLabel": { uz: "Kadrlar bo'limi boshlig'i: {name}", ru: "Начальник отдела кадров: {name}" },
  "departments.openTimesheet": { uz: "Tabelni ochish", ru: "Открыть табель" },
  "departments.createError": { uz: "Bo'limni yaratib bo'lmadi", ru: "Не удалось создать отдел" },
  "departments.deleteError": { uz: "Bo'limni o'chirib bo'lmadi", ru: "Не удалось удалить отдел" },

  "newDepartment.nameLabel": { uz: "Bo'lim nomi", ru: "Название отдела" },
  "newDepartment.namePlaceholder": {
    uz: "Raqamli ta'lim texnologiyalari markazi",
    ru: "Центр цифровых образовательных технологий",
  },

  "department.hrHeadLabel": { uz: "Kadrlar bo'limi boshlig'i:", ru: "Начальник отдела кадров:" },
  "department.hrHeadPlaceholder": { uz: "F.I.Sh.", ru: "Ф.И.О." },
  "department.backAria": { uz: "Bo'limlarga qaytish", ru: "Назад к отделам" },
  "department.archive": { uz: "Arxiv", ru: "Архив" },
  "department.currentMonthNote": {
    uz: "Joriy oy — o'zgarishlar avtomatik saqlanadi",
    ru: "Текущий месяц — изменения сохраняются автоматически",
  },
  "department.currentBadge": { uz: "Joriy oy", ru: "Текущий" },
  "department.nameSaveError": { uz: "Nomni saqlab bo'lmadi", ru: "Не удалось сохранить название" },
  "department.hrHeadSaveError": { uz: "Kadrlar bo'limini saqlab bo'lmadi", ru: "Не удалось сохранить отдел кадров" },

  "saved.saving": { uz: "Saqlanmoqda…", ru: "Сохранение…" },
  "saved.saved": { uz: "Saqlandi", ru: "Сохранено" },

  "archive.title": { uz: "Arxiv — {name}", ru: "Архив — {name}" },
  "archive.subtitle": {
    uz: "O'tgan oylar, faqat ko'rish va yuklab olish",
    ru: "Прошедшие месяцы, только просмотр и скачивание",
  },
  "archive.backAria": { uz: "Tabelga qaytish", ru: "Назад к табелю" },
  "archive.emptyTitle": { uz: "Arxiv hozircha bo'sh", ru: "Архив пока пуст" },
  "archive.emptyDescription": {
    uz: "Oylar tugashi bilan bu yerga tushadi.",
    ru: "Сюда попадут месяцы, как только они закончатся.",
  },

  "archiveMonth.backAria": { uz: "Arxivga qaytish", ru: "Назад в архив" },
  "archiveMonth.readOnlyBadge": { uz: "Faqat ko'rish", ru: "Только просмотр" },

  "grid.emptyTitleLocked": { uz: "Bu oyda xodimlar bo'lmagan", ru: "В этом месяце не было сотрудников" },
  "grid.emptyTitleOpen": { uz: "Tabelda hozircha xodimlar yo'q", ru: "В табеле пока нет сотрудников" },
  "grid.emptyDescriptionLocked": {
    uz: "Oy allaqachon o'tgan va tahrirlash uchun yopiq.",
    ru: "Месяц уже прошёл и закрыт для редактирования.",
  },
  "grid.emptyDescriptionOpen": {
    uz: "Bu oy uchun tabelni to'ldirishni boshlash uchun birinchi xodimni qo'shing.",
    ru: "Добавьте первого сотрудника, чтобы начать заполнять табель на этот месяц.",
  },
  "grid.deleteEmployeeTitle": { uz: "Xodimni o'chirasizmi?", ru: "Удалить сотрудника?" },
  "grid.deleteEmployeeDescription": {
    uz: "«{name}» bu oy tabelidan o'chiriladi.",
    ru: "«{name}» будет удалён из табеля за этот месяц.",
  },

  "grid.colNum": { uz: "№", ru: "№" },
  "grid.colName": { uz: "F.I.Sh.", ru: "Ф.И.О." },
  "grid.colPosition": { uz: "Lavozimi", ru: "Должность" },
  "grid.colRate": { uz: "Hissa", ru: "Ставка" },

  "row.dragTitle": { uz: "Sudrab o'tkazish", ru: "Перетащить" },
  "row.managerAlwaysFirst": { uz: "Rahbar — doim birinchi", ru: "Руководитель — всегда первый" },
  "row.lockedTitle": { uz: "Oy tahrirlash uchun yopiq", ru: "Месяц закрыт для редактирования" },
  "row.leaveDialogTitle": {
    uz: "Ta'til / kasallik / o'z hisobidan",
    ru: "Отпуск / больничный / за свой счёт",
  },
  "row.makeManager": { uz: "Rahbar qilish", ru: "Сделать руководителем" },
  "row.deleteEmployee": { uz: "Xodimni o'chirish", ru: "Удалить сотрудника" },

  "addEmployee.cta": { uz: "Xodim qo'shish", ru: "Добавить сотрудника" },
  "addEmployee.searchPlaceholder": { uz: "Bo'lim xodimlarini qidirish…", ru: "Поиск по сотрудникам отдела…" },
  "addEmployee.noneFound": { uz: "Hech kim topilmadi", ru: "Никого не найдено" },
  "addEmployee.noMoreInHistory": {
    uz: "Bo'lim tarixida boshqa hech kim yo'q",
    ru: "В истории отдела больше никого нет",
  },
  "addEmployee.addAction": { uz: "+ Qo'shish", ru: "+ Добавить" },
  "addEmployee.newEmployee": { uz: "Yangi xodim", ru: "Новый сотрудник" },
  "addEmployee.backToList": { uz: "Xodimlar ro'yxatiga", ru: "К списку сотрудников" },
  "addEmployee.namePlaceholder": { uz: "F.I.Sh.", ru: "Ф.И.О." },
  "addEmployee.positionPlaceholder": { uz: "Lavozimi", ru: "Должность" },
  "addEmployee.managerCheckbox": { uz: "Rahbar", ru: "Руководитель" },
  "addEmployee.submit": { uz: "Qo'shish", ru: "Добавить" },

  "toolbar.clear": { uz: "Tozalash", ru: "Очистить" },

  "leave.title": { uz: "Yo'q bo'lgan kunlar — {name}", ru: "Дни отсутствия — {name}" },
  "leave.dayType": { uz: "Kun turi", ru: "Тип дня" },
  "leave.clearAllOfType": { uz: "Barcha «{label}» ni tozalash ({count})", ru: "Очистить все «{label}» ({count})" },
  "leave.chooseEndDay": { uz: "Davrning oxirgi kunini tanlang", ru: "Выберите последний день периода" },
  "leave.chooseStartDay": { uz: "Davrning birinchi kunini tanlang", ru: "Выберите первый день периода" },
  "leave.rangeSuffix": {
    uz: " — davr keyingi oyga o'tishi mumkin",
    ru: " — период может переходить на следующий месяц",
  },
  "leave.notArrivedYet": { uz: " (hali kelmagan)", ru: " (ещё не наступил)" },
  "leave.alreadyMarked": { uz: "Allaqachon belgilangan", ru: "Уже отмечено" },
  "leave.remove": { uz: "Olib tashlash", ru: "Убрать" },
  "leave.clearPeriod": { uz: "Davrni tozalash", ru: "Очистить период" },
  "leave.apply": { uz: "Qo'llash", ru: "Применить" },
  "leave.notMarkedError": { uz: "Keyingi oydagi kunlar belgilanmadi", ru: "Дни в следующем месяце не отмечены" },
  "leave.notMarkedErrorDetail": {
    uz: "«{name}» {month} tarkibida yo'q",
    ru: "«{name}» отсутствует в составе {month}",
  },
  "leave.saveNextMonthError": {
    uz: "Keyingi oydagi kunlarni saqlab bo'lmadi",
    ru: "Не удалось сохранить дни в следующем месяце",
  },

  "legend.title": { uz: "Izoh:", ru: "Обозначения:" },

  "export.colNum": { uz: "№", ru: "№" },
  "export.colName": { uz: "F.I.O.", ru: "Ф.И.О." },
  "export.colPosition": { uz: "Lavozimi", ru: "Должность" },
  "export.colRate": { uz: "Hissa", ru: "Ставка" },
  "export.legendTitle": { uz: "Izoh:", ru: "Обозначения:" },
  "export.managerLabel": { uz: "Markaz rahbari:", ru: "Руководитель:" },
  "export.hrHeadLabel": { uz: "Xodimlar bo'limi boshlig'i:", ru: "Начальник отдела кадров:" },
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(locale: Locale, key: TranslationKey, vars?: Record<string, string | number>): string {
  let str: string = dict[key][locale];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) str = str.split(`{${k}}`).join(String(v));
  }
  return str;
}

const RU_MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

const UZ_MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
] as const;

/** Locale-aware month name for on-screen display and, now, for the
 * exported/printed document's title line too. */
export function monthName(month: number, locale: Locale): string {
  return locale === "ru" ? RU_MONTHS[month - 1] : UZ_MONTHS[month - 1];
}

/** Title line for the exported document / print header / on-screen page
 * title. Uzbek keeps the exact wording verified against the real government
 * template; Russian mirrors its structure with natural Russian officialese
 * (there's no real Russian template to verify byte-for-byte, so this is a
 * translation, not a reproduction). */
export function exportTitleLine(departmentName: string, year: number, month: number, locale: Locale): string {
  const dept = departmentName.trim().toUpperCase();
  const month_ = monthName(month, locale).toUpperCase();
  if (locale === "ru") {
    return `ТАБЕЛЬ УЧЁТА РАБОЧЕГО ВРЕМЕНИ СОТРУДНИКОВ ${dept} ЗА ${month_} ${year} ГОДА`;
  }
  return `${dept} XODIMLARINING ${year}-YIL ${month_} OYI  UCHUN TABELI`;
}

const RU_WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const; // Monday-first
const UZ_WEEKDAY_LABELS = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"] as const; // Monday-first

export function weekdayLabels(locale: Locale): readonly string[] {
  return locale === "ru" ? RU_WEEKDAY_LABELS : UZ_WEEKDAY_LABELS;
}

const RU_CODE_MEANINGS: Record<DayCode, string> = {
  YA: "воскресенье",
  SH: "суббота",
  MT: "отпуск",
  OZH: "за свой счёт",
  KV: "больничный",
  B: "праздник",
};

/** The codes' plain-language explanation, shown in the legend and tooltips. */
export function codeMeaning(code: DayCode, locale: Locale, uzMeaning: string): string {
  return locale === "ru" ? RU_CODE_MEANINGS[code] : uzMeaning;
}

// The codes themselves (Ya, M/T, O'z/h, K/v, B — from CODE_LABELS) are the
// official abbreviations printed on the real verified Uzbek government form.
// There's no equivalent real Russian form to copy from, so for the Russian
// side we borrow the actual codes from Russia's own unified timesheet form
// (Т-13): В (выходной), ОТ (ежегодный оплачиваемый отпуск), ДО (отпуск без
// сохранения з/платы — "за свой счёт"), Б (больничный). "B" (holiday/bayram)
// has no Т-13 equivalent — that form folds holidays into "В" — but this app
// tracks holidays as their own category, so П (праздник) is our own choice.
const RU_CODE_LABELS: Record<DayCode, string> = {
  YA: "В",
  SH: "С",
  MT: "ОТ",
  OZH: "ДО",
  KV: "Б",
  B: "П",
};

export function codeLabel(code: DayCode, locale: Locale, uzLabel: string): string {
  return locale === "ru" ? RU_CODE_LABELS[code] : uzLabel;
}

/** Russian inflects день/дня/дней by count; Uzbek "kun" doesn't inflect. */
export function dayCountLabel(count: number, locale: Locale): string {
  if (locale === "uz") return `${count} kun`;
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = "дней";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "день";
    else if (mod10 >= 2 && mod10 <= 4) word = "дня";
  }
  return `${count} ${word}`;
}
