/**
 * Status computation service.
 *
 * Status is never stored in the database rather COMPUTED.
 *
 * Status Logic:
 *  1. COMPLETED — stage is HARVESTED
 *  2. AT_RISK   — stage is still PLANTED after 14 days since planting, OR
 *                 no field update has been logged in the last 7 days
 *  3. ACTIVE    — everything else
 */

const AT_RISK_NO_PROGRESS_DAYS = 14; // stuck at PLANTED for this many days
const AT_RISK_NO_UPDATE_DAYS = 7;    // no update logged in this many days

/**
 * @param {object} field - A field record with its `updates` relation loaded
 * @returns {'COMPLETED' | 'AT_RISK' | 'ACTIVE'}
 */
function computeStatus(field) {
  if (field.stage === "HARVESTED") return "COMPLETED";

  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;

  // stuck at PLANTED for too long
  if (field.stage === "PLANTED") {
    const daysSincePlanting = (now - new Date(field.plantingDate).getTime()) / msPerDay;
    if (daysSincePlanting >= AT_RISK_NO_PROGRESS_DAYS) return "AT_RISK";
  }

  // no update logged recently
  const lastUpdate =
    field.updates && field.updates.length > 0
      ? new Date(
        Math.max(...field.updates.map((u) => new Date(u.createdAt).getTime()))
      )
      : null;

  if (!lastUpdate) return "AT_RISK"; // never logged an update. always at risk

  const daysSinceUpdate = (now - lastUpdate.getTime()) / msPerDay;
  if (daysSinceUpdate >= AT_RISK_NO_UPDATE_DAYS) return "AT_RISK";

  return "ACTIVE";
}

/**
 * attach computed status to a single field object.
 */
function withStatus(field) {
  return { ...field, status: computeStatus(field) };
}

/**
 * attach computed status to an array of fields.
 */
function withStatusMany(fields) {
  return fields.map(withStatus);
}

module.exports = { computeStatus, withStatus, withStatusMany };
