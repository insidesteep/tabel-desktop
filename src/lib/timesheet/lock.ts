function realNow(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Months strictly before the real current calendar month are read-only. */
export function isPastMonth(year: number, month: number): boolean {
  const { year: curYear, month: curMonth } = realNow();
  return year < curYear || (year === curYear && month < curMonth);
}

export function isCurrentMonth(year: number, month: number): boolean {
  const { year: curYear, month: curMonth } = realNow();
  return year === curYear && month === curMonth;
}
