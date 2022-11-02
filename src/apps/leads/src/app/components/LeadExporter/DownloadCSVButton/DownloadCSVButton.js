import { Component } from "react";
import csvDownload from "json-to-csv-export";
import * as moment from "moment";
import { connect } from "react-redux";

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
     *
     * Utilizes the start and end date in the Store
     * @returns {string} The date portion in 'YYYY-MM-DD_YYYY-MM-DD' format
     */
    setFilenameDate() {
      // If the user has selected "ALL", determine the minimum and maximum dates
      if (this.props.filter.dateRange === DATE_PRESETS.ALL) {
        let earliestDate = moment();
        let latestDate = moment();
        this.props.leads.forEach((lead) => {
          if (moment(lead.dateCreated).isBefore(earliestDate)) {
            earliestDate = lead.dateCreated;
          } else if (moment(lead.dateCreated).isAfter(latestDate)) {
            latestDate = lead.dateCreated;
          }
        });
        return `${moment(earliestDate).format("YYYY-MM-DD")}_${moment(
          latestDate
        ).format("YYYY-MM-DD")}`;
      } else {
        return `${moment(this.props.filter.startDate).format(
          "YYYY-MM-DD"
        )}_${moment(this.props.filter.endDate).format("YYYY-MM-DD")}`;
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
