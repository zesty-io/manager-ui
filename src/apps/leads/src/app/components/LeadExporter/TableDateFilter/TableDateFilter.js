import * as moment from "moment";
import { Component } from "react";
import { connect } from "react-redux";

import { FieldTypeDate } from "@zesty-io/material";
import { FormControl, FormLabel, Select, MenuItem } from "@mui/material";

import { DATE_PRESETS } from "./TableDateFilter.model";
import {
  setFilterEndDate,
  setFilterDateRange,
  setFilterStartDate,
} from "../../../../store/filter";

import styles from "./TableDateFilter.less";

const datePresets = [
  { value: DATE_PRESETS.ALL, text: "ALL" },
  { value: DATE_PRESETS.THIRTY, text: "30 Days" },
  { value: DATE_PRESETS.SIXTY, text: "60 Days" },
  { value: DATE_PRESETS.NINETY, text: "90 Days" },
  { value: DATE_PRESETS.CUSTOM, text: "Custom" },
];

export default connect((state) => {
  return {
    filter: state.filter,
  };
})(
  class TableDateFilter extends Component {
    state = {
      endDate: this.props.endDate,
      startDate: this.props.startDate,
      datePickerIsVisible: false,
    };

    /**
     * Sets the Leads "End Date" filter
     * Dispatches the Set Filter End Date action
     * @param {event} The date input's On Change event
     */
    setEndDate = (value) => {
      this.props.dispatch(setFilterEndDate(moment(value).format("YYYY-MM-DD")));
    };

    /**
     * Sets the Leads "Start Date" filter
     * Dispatches the Set Filter Start Date action
     * @param {event} The date input's On Change event
     */
    setStartDate = (value) => {
      this.props.dispatch(
        setFilterStartDate(moment(value).format("YYYY-MM-DD"))
      );
    };

    /**
     * Triggered when the date range is changed
     *
     * Emits the SetFilterEndDate and SetFilterStartDate for each case
     */
    onDateRangeChange = (value) => {
      // Hide the datepicker by default
      this.setState({
        datePickerIsVisible: false,
      });
      switch (value) {
        case DATE_PRESETS.THIRTY:
          this.props.dispatch(setFilterDateRange(DATE_PRESETS.THIRTY));
          this.props.dispatch(setFilterEndDate(moment().format("YYYY-MM-DD")));
          this.props.dispatch(
            setFilterStartDate(
              moment().subtract(30, "days").format("YYYY-MM-DD")
            )
          );
          break;
        case DATE_PRESETS.SIXTY:
          this.props.dispatch(setFilterDateRange(DATE_PRESETS.SIXTY));
          this.props.dispatch(setFilterEndDate(moment().format("YYYY-MM-DD")));
          this.props.dispatch(
            setFilterStartDate(
              moment().subtract(60, "days").format("YYYY-MM-DD")
            )
          );
          break;
        case DATE_PRESETS.NINETY:
          this.props.dispatch(setFilterDateRange(DATE_PRESETS.NINETY));
          this.props.dispatch(setFilterEndDate(moment().format("YYYY-MM-DD")));
          this.props.dispatch(
            setFilterStartDate(
              moment().subtract(90, "days").format("YYYY-MM-DD")
            )
          );
          break;
        case DATE_PRESETS.ALL:
          this.props.dispatch(setFilterDateRange(DATE_PRESETS.ALL));
          this.props.dispatch(setFilterEndDate(""));
          this.props.dispatch(setFilterStartDate(""));
          break;
        case DATE_PRESETS.CUSTOM:
          this.props.dispatch(setFilterDateRange(DATE_PRESETS.CUSTOM));
          this.props.dispatch(setFilterEndDate(new Date()));
          this.props.dispatch(setFilterStartDate(new Date()));
          this.setState({
            datePickerIsVisible: true,
          });
          break;
        default:
          break;
      }
    };

    render() {
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
                value={moment(this.props.filter.startDate).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
                onChange={this.setStartDate}
              />
            </div>
            <div className={styles.customDate}>
              <FieldTypeDate
                name="end-date"
                label="End Date"
                value={moment(this.props.filter.endDate).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
                onChange={this.setEndDate}
              />
            </div>
          </div>
        </div>
      );
    }
  }
);
