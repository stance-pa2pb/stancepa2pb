// ============================================================
// STANCE PA2PB — shared/utils.js
// Small helpers shared across pages. Keep this file boring —
// generic DOM/formatting helpers only, nothing feature-specific.
// ============================================================

// Escapes user-submitted text before it goes into innerHTML, so a
// name/car/city/etc. submitted through a public form can't break out
// of the markup and run script. Use this anywhere untrusted data is
// interpolated into a template string bound for innerHTML.
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Accepts SA numbers like 0679503097 or +27679503097, with optional
// spaces/dashes between groups.
function isValidWhatsapp(number) {
  const digitsOnly = String(number || '').replace(/[\s-]/g, '');
  return /^(0|\+27)[0-9]{9}$/.test(digitsOnly);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}
