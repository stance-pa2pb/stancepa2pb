// ============================================================
// STANCE PA2PB — shared/config.js
//
// SINGLE SOURCE OF TRUTH for connection details, vehicle
// categories, feature flags, and pricing. Every page
// (index.html, app.html, office.html) loads this file instead
// of redefining these values — change something here once and
// every page picks it up.
//
// This is a plain global script (not an ES module) on purpose:
// zero build step, works from any static host, and works when
// opened directly from disk too.
// ============================================================

const SUPABASE_URL = 'https://wtyoamcnywgltftfewxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PkcCpgYgR_AaBQEZP-ZxBg_nrGl6115'; // safe to expose publicly

// Founder / office contact — used for WhatsApp deep links across pages.
const FOUNDER_WHATSAPP = '27679503097';

// ------------------------------------------------------------
// Vehicle categories & feature flags now live in the database
// (vehicle_categories / feature_flags tables) so they can be
// turned on/off from the admin panel without a code change or
// redeploy. These functions fetch them, with a hardcoded
// fallback ONLY so the app still works if that fetch fails —
// the database is always the real source of truth.
// ------------------------------------------------------------

const FALLBACK_VEHICLE_CATEGORIES = [
  { key: 'stance_custom', label: 'STANCE / Custom', enabled: true, base_fare: 50, per_km_rate: 7, per_min_rate: 0, min_fare: 50 }
];

const FALLBACK_FEATURE_FLAGS = { cash_payments: true };

async function fetchEnabledVehicleCategories() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vehicle_categories?enabled=eq.true&order=sort_order.asc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : FALLBACK_VEHICLE_CATEGORIES;
  } catch (err) {
    console.warn('Could not load vehicle categories, using fallback:', err);
    return FALLBACK_VEHICLE_CATEGORIES;
  }
}

async function fetchFeatureFlags() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/feature_flags?select=key,enabled`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error('bad response');
    const rows = await res.json();
    const flags = {};
    rows.forEach(r => { flags[r.key] = r.enabled; });
    return flags;
  } catch (err) {
    console.warn('Could not load feature flags, using fallback:', err);
    return FALLBACK_FEATURE_FLAGS;
  }
}

function isFeatureEnabled(flags, key) {
  return !!(flags && flags[key]);
}

// ------------------------------------------------------------
// Centralized fare estimate. Mirrors the logic the request-ride
// Edge Function uses server-side (that's the source of truth for
// the CONFIRMED fare) — this is only the up-front client estimate
// shown before the rider confirms, using straight-line distance
// since we don't have a routing API yet.
// ------------------------------------------------------------
function estimateFare(category, distanceKm) {
  if (!category || distanceKm == null) return null;
  const raw = Number(category.base_fare) + Number(category.per_km_rate) * distanceKm;
  return Math.max(Math.round(raw), Number(category.min_fare));
}
