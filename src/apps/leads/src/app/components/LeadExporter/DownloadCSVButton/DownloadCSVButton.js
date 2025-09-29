import { Component } from "react";
import csvDownload from "json-to-csv-export";
import { connect } from "react-redux";
import {
  format,
  parseISO,
  isValid,
  min as dateMin,
  max as dateMax,
} from "date-fns";

import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

import { DATE_PRESETS } from "../TableDateFilter/TableDateFilter.model";
import * as FilterService from "../../../views/Leads/LeadFilter.service";

export default connect((state) => {
  return {
    filter: state.filter,
    leads: state.leads,
  };
})(
  class DownloadCSVButton extends Component {
    constructor(props) {
      super(props);
      this.props = props;
    }

    /**
     * Determine which leads should be included in the download based on user input
     */
    filterLeadsData = () => {
      let leads = FilterService.filterByFormGroup(
        this.props.leads,
        this.props.filter
      );
      leads = FilterService.filterByDate(leads, this.props.filter);
      leads = FilterService.filterByFuzzyText(leads, this.props.filter);
      const forms = leads
        .map((lead) => ({ ...lead.formData, timestamp: lead.dateCreated }))
        .filter((lead) => lead);

      // Set the file name in this format: FORMGROUP_DATERANGE
      let filename = ``;
      if (this.props.filter.formGroup) {
        filename += `${this.props.filter.formGroup}_`;
      }
      filename += this.setFilenameDate();

      csvDownload(forms, `${filename}.csv`);
    };

    /**
     * Sets the date portion of the CSV file
     * Returns 'YYYY-MM-DD_YYYY-MM-DD'
     */
    setFilenameDate() {
      const toDate = (v) => {
        if (v instanceof Date) return v;
        const iso = parseISO(String(v));
        return isValid(iso) ? iso : new Date(v);
      };

      if (this.props.filter.dateRange === DATE_PRESETS.ALL) {
        const dates = (this.props.leads || [])
          .map((lead) => toDate(lead?.dateCreated))
          .filter((d) => isValid(d));

        if (!dates.length) {
          const today = new Date();
          const ymd = format(today, "yyyy-MM-dd");
          return `${ymd}_${ymd}`;
        }

        const earliest = dateMin(dates);
        const latest = dateMax(dates);

        return `${format(earliest, "yyyy-MM-dd")}_${format(
          latest,
          "yyyy-MM-dd"
        )}`;
      } else {
        const start = toDate(this.props.filter.startDate);
        const end = toDate(this.props.filter.endDate);
        return `${format(start, "yyyy-MM-dd")}_${format(end, "yyyy-MM-dd")}`;
      }
    }

    render() {
      return (
        <Button
          variant="contained"
          onClick={() => this.filterLeadsData()}
          title="Export CSV of lead data by selected filters"
          startIcon={<DownloadIcon />}
        >
          Export CSV
        </Button>
      );
    }
  }
);
