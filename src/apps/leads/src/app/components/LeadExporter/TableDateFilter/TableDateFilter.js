import { Component } from "react";
import { connect } from "react-redux";
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

const datePresets = [
  { value: DATE_PRESETS.ALL, text: "ALL" },
  { value: DATE_PRESETS.THIRTY, text: "30 Days" },
  { value: DATE_PRESETS.SIXTY, text: "60 Days" },
  { value: DATE_PRESETS.NINETY, text: "90 Days" },
  { value: DATE_PRESETS.CUSTOM, text: "Custom" },
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
      this.props.dispatch(setFilterStartDate(value ? this.fmtYMD(value) : ""));
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
      const { filter } = this.props;

      return (
        <div>
          <FormControl fullWidth size="small">
            <FormLabel sx={{ color: "#c3cddf" }}>Date Range</FormLabel>
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
                label="Start Date"
                value={toPickerDate(filter.startDate)}
                onChange={this.setStartDate}
              />
            </div>

            <div className={styles.customDate}>
              <FieldTypeDate
                name="end-date"
                label="End Date"
                value={toPickerDate(filter.endDate)}
                onChange={this.setEndDate}
              />
            </div>
          </div>
        </div>
      );
    }
  }
);
