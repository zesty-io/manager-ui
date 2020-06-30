// Provides reusable filter actions on leads
import * as moment from "moment";

import { FORM_GROUP_PRESETS } from "../../components/LeadExporter/FormGroupSelector/FormGroupSelector.model";
import { DATE_PRESETS } from "../../components/LeadExporter/TableDateFilter/TableDateFilter.model";

/**
 * Filters a list of leads by date
 *
 * @param {Lead[]} leads The leads being filtered
 * @param {Filter} filter The filter parameters. See the State properties in the Filter reducer
 * @returns {Lead[]} The list of leads within the provided minimum and maximum dates
 */
export function filterByDate(leads, filter) {
  if (filter.dateRange === DATE_PRESETS.ALL) {
    return leads;
  }
  const maximumDate = filter.endDate;
  const minimumDate = filter.startDate;
  return leads
    .filter(lead =>
      maximumDate
        ? moment(lead.dateCreated).isSameOrBefore(maximumDate, "day")
        : true
    )
    .filter(lead =>
      minimumDate
        ? moment(lead.dateCreated).isSameOrAfter(minimumDate, "day")
        : true
    );
}

/**
 * Filters a list of leads by their form group
 *
 * @param {Lead[]} leads The leads being filtered
 * @param {Filter} filter The filter parameters. See the State properties in the Filter reducer
 * @returns {Lead[]} The list of leads who belong to the form group
 */
export function filterByFormGroup(leads, filter) {
  if (filter.formGroup === FORM_GROUP_PRESETS.ALL) {
    return leads;
  }
  return leads.filter(lead =>
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
  let fuzzyTextFilter = filter.fuzzyText;
  return leads.filter(lead => {
    if (!fuzzyTextFilter) {
      return true;
    }
    fuzzyTextFilter = fuzzyTextFilter.toLowerCase();
    if (lead.email.toLowerCase().indexOf(fuzzyTextFilter) >= 0) {
      return true;
    }
    if (lead.firstName.toLowerCase().indexOf(fuzzyTextFilter) >= 0) {
      return true;
    }
    if (lead.lastName.toLowerCase().indexOf(fuzzyTextFilter) >= 0) {
      return true;
    }
    for (const key in lead.formData) {
      if (lead.formData[key].toLowerCase().indexOf(fuzzyTextFilter) >= 0) {
        return true;
      }
    }
    return false;
  });
}
