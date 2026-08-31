import { Component } from "react";
import { connect } from "react-redux";
import { createBrowserHistory } from "history";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { ConfirmDialog } from "@zesty-io/material";

import { deleteLead } from "../../../store/leads";
import * as FilterService from "../../views/Leads/LeadFilter.service";

function filterLeadsData(leads, filter) {
  let filteredLeads = FilterService.filterByFormGroup(leads, filter);
  filteredLeads = FilterService.filterByDate(filteredLeads, filter);
  filteredLeads = FilterService.filterByFuzzyText(filteredLeads, filter);
  return filteredLeads;
}

export default connect((state) => {
  const leads = filterLeadsData(state.leads, state.filter);
  return {
    filter: state.filter,
    leads,
  };
})(
  class LeadsTable extends Component {
    history = createBrowserHistory();

    constructor(props) {
      super(props);

      this.props = props;
      this.state = {
        currentLead: null, // The current lead being displayed in the modal
        loading: false, // Whether a request is being processed
        modalIsOpen: false, // Whether the modal is open (TRUE) or not (FALSE)
      };
    }

    componentDidMount() {
      this.determineIfModalShouldBeOpen();
    }

    /**
     * Closes the modal and clears the selected lead from the route
     */
    closeModalAndUpdateRoute = () => {
      this.history.push(`#!`);
      this.setState({
        currentLead: null,
        modalIsOpen: false,
      });
    };

    /**
     * Based on the search parameters in the URL, decides whether the modal should be open
     */
    determineIfModalShouldBeOpen() {
      const query = new URLSearchParams(this.props.location.search);

      let currentLeadZuid = query.get("lead");
      if (currentLeadZuid) {
        // Remove any slashes from the query string
        currentLeadZuid = currentLeadZuid.replace(/\//, "");
        const currentLead = this.props.leads.find(
          (lead) => lead.zuid === currentLeadZuid
        );
        if (currentLead) {
          this.openModalAndUpdateRoute(currentLead);
        }
      }
    }

    /**
     * Triggers a Delete Lead action
     *
     * Sets the State's Loading value to TRUE
     */
    deleteLead = (leadZuid) => {
      this.setState({ loading: true });
      this.props
        .dispatch(deleteLead(leadZuid))
        .finally(() => this.setState({ loading: false, modalIsOpen: false }));
    };

    /**
     * Supplies the keys of a lead's formData to display
     *
     * @param {String[]} keysInData All of the lead's formData keys
     * @param {number} numFieldsToRender The number of fields to render
     * @returns {String[]} The keys of each formData value of the lead to render
     */
    generateFormDataKeysToDisplay(keysInData, numFieldsToRender = 0) {
      // Display the first X keys
      return numFieldsToRender !== 0
        ? keysInData.slice(0, numFieldsToRender)
        : keysInData;
    }

    /**
     * Opens a modal with the selected lead and updates the route
     */
    openModalAndUpdateRoute = (lead) => {
      this.history.push(`#!?lead=${lead.zuid}`);
      this.setState({
        currentLead: lead,
        modalIsOpen: true,
      });
    };

    /**
     * Renders the first X items in the form data of the lead
     *
     * Used in the Leads Table
     * @param {FormData} data The Lead's formData object
     * @param {number} numFieldsToRender The number of fields to show
     */
    renderTableFormData(data, numFieldsToRender = 0) {
      const keysInData = Object.keys(data || {});
      const keysToDisplay = this.generateFormDataKeysToDisplay(
        keysInData,
        numFieldsToRender
      );
      const dataList = keysToDisplay.map((key, index) => {
        return (
          <Box component="li" sx={{ mb: 0.5 }} key={index}>
            {keysToDisplay[index]}: {data[keysToDisplay[index]]}
          </Box>
        );
      });
      // Display an ellipsis if there are extra fields
      let hasMoreFields;
      if (numFieldsToRender !== 0 && keysInData.length > numFieldsToRender) {
        hasMoreFields = <li>...</li>;
      }
      return (
        <ul>
          {dataList}
          {hasMoreFields}
        </ul>
      );
    }

    render() {
      return (
        <div>
          <Box
            component="table"
            className="table-auto"
            data-cy="leadsTable"
            sx={(theme) => ({
              width: "100%",
              "& thead tr th": {
                textAlign: "left",
                pt: 2,
                px: 1,
                pb: 1,
                "&:first-of-type": { pl: 4 },
                "&:last-child": { pr: 4 },
              },
              "& tbody tr td": {
                p: 1,
                border: "none",
                "&:first-of-type": { pl: 4 },
                "&:last-child": { pr: 4 },
                "& ul": {
                  listStyleType: "none",
                  m: 0,
                },
              },
              "& tbody tr:hover": {
                backgroundColor: theme.palette.leads.rowHover,
                borderRight: `1px solid ${theme.palette.leads.rowHoverBorder}`,
                cursor: "pointer",
              },
            })}
          >
            <thead>
              <tr>
                <th>Date (system)</th>
                <th>Form Group</th>
                <th>Email</th>
                <th>Form Body</th>
              </tr>
            </thead>
            <tbody>
              {this.props.leads.map((data) => {
                return (
                  <tr
                    key={`${data.zuid}-${data.dateCreated}`}
                    data-cy="leadsTableRow"
                    onClick={() => this.openModalAndUpdateRoute(data)}
                  >
                    <td>{data.dateCreated || "N/A"}</td>
                    <td>{data.form || "N/A"}</td>
                    <td>{data.email || "N/A"}</td>
                    <td>{this.renderTableFormData(data.formData, 3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Box>
          <ConfirmDialog
            open={this.state.modalIsOpen}
            sx={{ width: "100%" }}
            title={
              <div>
                {this.state.currentLead ? (
                  <Box
                    component="ul"
                    sx={{ listStyleType: "none", "& li": { mb: 0.5 } }}
                  >
                    <li>
                      <strong>Date Created</strong>:{" "}
                      {this.state.currentLead.dateCreated}
                    </li>
                    {this.state.currentLead &&
                      this.state.currentLead.formData &&
                      Object.keys(this.state.currentLead.formData).map(
                        (key) => {
                          return (
                            <li key={key}>
                              <Box
                                component="span"
                                sx={{ fontWeight: "bold", mr: 1 }}
                              >
                                {key}:
                              </Box>
                              <span>
                                {this.state.currentLead.formData[key]}
                              </span>
                            </li>
                          );
                        }
                      )}
                  </Box>
                ) : (
                  ""
                )}
              </div>
            }
          >
            <div>
              {this.state.currentLead &&
                this.props.leads.find(
                  (lead) => lead.zuid === this.state.currentLead.zuid
                ) && (
                  <>
                    <Button
                      variant="outlined"
                      data-cy="deleteLeadCancel"
                      onClick={() => {
                        this.setState({
                          modalIsOpen: false,
                        });
                      }}
                      startIcon={<DoDisturbAltIcon />}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      data-cy="deleteLeadConfirm"
                      disabled={this.state.loading}
                      onClick={() =>
                        this.deleteLead(this.state.currentLead.zuid)
                      }
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </>
                )}
            </div>
          </ConfirmDialog>
        </div>
      );
    }
  }
);
