export function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

export function formatShortCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(0)} tr`;
  }
  return formatCurrency(amount);
}

export function formatBillions(amount: number): string {
  const val = amount / 1_000_000_000;
  return `${val % 1 === 0 ? val : val.toFixed(1)} tỷ`;
}

export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
