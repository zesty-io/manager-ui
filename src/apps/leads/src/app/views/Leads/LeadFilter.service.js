// Provides reusable filter actions on leads
import { parseISO, isBefore, isAfter, isEqual, startOfDay } from "date-fns";

import { FORM_GROUP_PRESETS } from "../../components/LeadExporter/FormGroupSelector/FormGroupSelector.model";
import { DATE_PRESETS } from "../../components/LeadExporter/TableDateFilter/TableDateFilter.model";

function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

  const iso = parseISO(String(v));
  if (!isNaN(iso.getTime())) return iso;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

/** Compare by calendar day, inclusive: a <= b */
function isOnOrBeforeDay(a, b) {
  const A = startOfDay(a);
  const B = startOfDay(b);
  return isBefore(A, B) || isEqual(A, B);
}

/** Compare by calendar day, inclusive: a >= b */
function isOnOrAfterDay(a, b) {
  const A = startOfDay(a);
  const B = startOfDay(b);
  return isAfter(A, B) || isEqual(A, B);
}

/**
 * Filters a list of leads by date
 *
 * @param {Lead[]} leads The leads being filtered
 * @param {Filter} filter The filter parameters. See the State properties in the Filter reducer
 * @returns {Lead[]} The list of leads within the provided minimum and maximum dates
 */
export function filterByDate(leads, filter) {
  if (filter.dateRange === DATE_PRESETS.ALL) return leads;

  const maximumDate = toDate(filter.endDate);
  const minimumDate = toDate(filter.startDate);

  return leads
    .filter((lead) => {
      if (!maximumDate) return true;
      const leadDate = toDate(lead?.dateCreated);
      return leadDate ? isOnOrBeforeDay(leadDate, maximumDate) : false;
    })
    .filter((lead) => {
      if (!minimumDate) return true;
      const leadDate = toDate(lead?.dateCreated);
      return leadDate ? isOnOrAfterDay(leadDate, minimumDate) : false;
    });
}

/**
 * Filters a list of leads by their form group
 *
 * @param {Lead[]} leads The leads being filtered
 * @param {Filter} filter The filter parameters. See the State properties in the Filter reducer
 * @returns {Lead[]} The list of leads who belong to the form group
 */
export function filterByFormGroup(leads, filter) {
  if (filter.formGroup === FORM_GROUP_PRESETS.ALL) return leads;
  return leads.filter((lead) =>
    filter.formGroup ? lead.form === filter.formGroup : true
  );
}

/**
 * Filters a list of leads by the existence of a string
 *
 * @param {Lead[]} leads The leads being filtered
 * @param {Filter} filter The filter parameters. See the State properties in the Filter reducer
 * @returns {Lead[]} The list of leads that contain the provided string somewhere in its data
 */
export function filterByFuzzyText(leads, filter) {
  let q = filter.fuzzyText;
  if (!q) return leads;

  q = String(q).toLowerCase();

  return leads.filter((lead) => {
    const inStr = (v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(q);

    if (inStr(lead.email)) return true;
    if (inStr(lead.firstName)) return true;
    if (inStr(lead.lastName)) return true;

    for (const key in lead.formData) {
      if (inStr(lead.formData[key])) return true;
    }
    return false;
  });
}
