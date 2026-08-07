export function toVnDayStart(date: Date) {
  const tzOffsetMs = 7 * 60 * 60 * 1000;
  const vn = new Date(date.getTime() + tzOffsetMs);
  return new Date(
    Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) -
      tzOffsetMs,
  );
}

export function addVnDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
