import { DATE_PRESETS } from "../app/components/TableDateFilter/TableDateFilter.model";

/**
 * Manages state related to filtering the leads data being displayed
 */
export function filter(
  state = {
    dateRange: DATE_PRESETS.ALL,
    endDate: "",
    fuzzyText: "",
    formGroup: "",
    startDate: ""
  },
  action
) {
  switch (action.type) {
    case "SET_FILTER_DATE_RANGE":
      return {
        ...state,
        dateRange: action.payload
      };
    case "SET_FILTER_END_DATE":
      return {
        ...state,
        endDate: action.payload
      };
    case "SET_FILTER_FORM_GROUP":
      return {
        ...state,
        formGroup: action.payload
      };
    case "SET_FILTER_START_DATE":
      return {
        ...state,
        startDate: action.payload
      };
    case "SET_FILTER_TEXT":
      return {
        ...state,
        fuzzyText: action.payload
      };
    default:
      return state;
  }
}

/**
 * Sets the user-friendly date range value for which leads to download
 *
 * @param {DATE_PRESETS} data The date range
 */
export function setFilterDateRange(data) {
  return {
    type: "SET_FILTER_DATE_RANGE",
    payload: data
  };
}

/**
 * Sets a filter for the end date of all leads to download
 *
 * @param {string} data The new date in YYYY-MM-DD format
 */
export function setFilterEndDate(data) {
  return {
    type: "SET_FILTER_END_DATE",
    payload: data
  };
}

/**
 * Sets a filter for the form group of all leads to download
 *
 * @param {string} data The selected group
 */
export function setFilterFormGroup(data) {
  return {
    type: "SET_FILTER_FORM_GROUP",
    payload: data
  };
}

/**
 * Sets a filter for the start date of all leads to download
 *
 * @param {string} data The new date in YYYY-MM-DD format
 */
export function setFilterStartDate(data) {
  return {
    type: "SET_FILTER_START_DATE",
    payload: data
  };
}

/**
 * Sets a filter for a text value in all leads to display
 *
 * This is used as a fuzzy text feature that searches specific top-level properties, and all formData properties within a lead
 * @param {string} data The user entered string to evaluate for
 */
export function setFilterText(data) {
  return {
    type: "SET_FILTER_TEXT",
    payload: data
  };
}
