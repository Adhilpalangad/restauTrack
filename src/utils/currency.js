// Currency utility functions
// All monetary values stored as paise (integers) internally
// Displayed as rupees in UI

export const toRupees = (paise) => (paise / 100).toFixed(2);

export const toPaise = (rupees) => Math.round(parseFloat(rupees) * 100);

export const formatCurrency = (paise) => {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatCurrencyDetailed = (paise) => {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCompact = (paise) => {
  const rupees = paise / 100;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
};

export const parseAmount = (value) => {
  const cleaned = String(value).replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
};
