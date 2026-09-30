import { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { FormControl, FormLabel, Select, MenuItem } from "@mui/material";
import { format, subDays, parseISO, isValid } from "date-fns";

import { DATE_PRESETS } from "./TableDateFilter.model";
import {
  setFilterEndDate,
  setFilterDateRange,
  setFilterStartDate,
} from "../../../../store/filter";

import styles from "./TableDateFilter.less";
import { FieldTypeDate } from "../../../../../../../shell/components/FieldTypeDate";

const getDatePresets = (t) => [
  { value: DATE_PRESETS.ALL, text: t("leads.datePresetAll") },
  { value: DATE_PRESETS.THIRTY, text: t("leads.datePreset30Days") },
  { value: DATE_PRESETS.SIXTY, text: t("leads.datePreset60Days") },
  { value: DATE_PRESETS.NINETY, text: t("leads.datePreset90Days") },
  { value: DATE_PRESETS.CUSTOM, text: t("leads.datePresetCustom") },
];

// Normalize any incoming value to a Date for the picker
function toPickerDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isValid(v) ? v : null;

  const iso = parseISO(String(v));
  if (isValid(iso)) return iso;

  const d = new Date(String(v));
  return isValid(d) ? d : null;
}

export default connect((state) => {
  return { filter: state.filter };
})(
  withTranslation()(
    class TableDateFilter extends Component {
      state = {
        endDate: this.props.endDate,
        startDate: this.props.startDate,
        datePickerIsVisible: false,
      };

      // "YYYY-MM-DD"
      fmtYMD = (d) => format(d, "yyyy-MM-dd");

      /**
       * Sets the Leads "End Date" filter
       */
      setEndDate = (value) => {
        this.props.dispatch(setFilterEndDate(value ? this.fmtYMD(value) : ""));
      };

      /**
       * Sets the Leads "Start Date" filter
       */
      setStartDate = (value) => {
        this.props.dispatch(
          setFilterStartDate(value ? this.fmtYMD(value) : "")
        );
      };

      /**
       * Triggered when the date range is changed
       */
      onDateRangeChange = (value) => {
        // Hide the datepicker by default
        this.setState({ datePickerIsVisible: false });

        const today = new Date();

        switch (value) {
          case DATE_PRESETS.THIRTY: {
            this.props.dispatch(setFilterDateRange(DATE_PRESETS.THIRTY));
            this.props.dispatch(setFilterEndDate(this.fmtYMD(today)));
            this.props.dispatch(
              setFilterStartDate(this.fmtYMD(subDays(today, 30)))
            );
            break;
          }
          case DATE_PRESETS.SIXTY: {
            this.props.dispatch(setFilterDateRange(DATE_PRESETS.SIXTY));
            this.props.dispatch(setFilterEndDate(this.fmtYMD(today)));
            this.props.dispatch(
              setFilterStartDate(this.fmtYMD(subDays(today, 60)))
            );
            break;
          }
          case DATE_PRESETS.NINETY: {
            this.props.dispatch(setFilterDateRange(DATE_PRESETS.NINETY));
            this.props.dispatch(setFilterEndDate(this.fmtYMD(today)));
            this.props.dispatch(
              setFilterStartDate(this.fmtYMD(subDays(today, 90)))
            );
            break;
          }
          case DATE_PRESETS.ALL: {
            this.props.dispatch(setFilterDateRange(DATE_PRESETS.ALL));
            this.props.dispatch(setFilterEndDate(""));
            this.props.dispatch(setFilterStartDate(""));
            break;
          }
          case DATE_PRESETS.CUSTOM: {
            this.props.dispatch(setFilterDateRange(DATE_PRESETS.CUSTOM));
            // initialize both to today; user can edit via pickers
            this.props.dispatch(setFilterEndDate(this.fmtYMD(today)));
            this.props.dispatch(setFilterStartDate(this.fmtYMD(today)));
            this.setState({ datePickerIsVisible: true });
            break;
          }
          default:
            break;
        }
      };

      render() {
        const { filter, t } = this.props;
        const datePresets = getDatePresets(t);

        return (
          <div>
            <FormControl fullWidth size="small">
              <FormLabel sx={{ color: "#c3cddf" }}>
                {t("shell.dateRange")}
              </FormLabel>
              <Select
                name="form-group-filter"
                variant="outlined"
                defaultValue={DATE_PRESETS.ALL}
                onChange={(evt) => this.onDateRangeChange(evt.target.value)}
              >
                {datePresets.map((datePreset, idx) => (
                  <MenuItem key={idx} value={datePreset.value}>
                    {datePreset.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div
              className={styles.customDateWrapper}
              style={this.state.datePickerIsVisible ? {} : { display: "none" }}
            >
              <div className={styles.customDate}>
                <FieldTypeDate
                  name="start-date"
                  label={t("leads.startDate")}
                  value={toPickerDate(filter.startDate)}
                  onChange={this.setStartDate}
                />
              </div>

              <div className={styles.customDate}>
                <FieldTypeDate
                  name="end-date"
                  label={t("leads.endDate")}
                  value={toPickerDate(filter.endDate)}
                  onChange={this.setEndDate}
                />
              </div>
            </div>
          </div>
        );
      }
    }
  )
);
