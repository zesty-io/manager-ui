import { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { createBrowserHistory } from "history";

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

import styles from "./LeadsTable.less";

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
   * Renders all of the form data of the lead
   *
   * Used in the Modal
   * @param {FormData} data The Lead's formData object
   */
  renderModalFormData(data) {
    const { t } = this.props;
    const keysInData = Object.keys(data);
    const keysToDisplay = this.generateFormDataKeysToDisplay(keysInData);
    const dataList = keysToDisplay.map((key, index) => {
      return (
        <tr key={index}>
          <td>{keysToDisplay[index]}</td>
          <td>{data[keysToDisplay[index]]}</td>
        </tr>
      );
    });
    return (
      <table className={styles.TableInfo}>
        <thead className={styles.TableHead}>
          <tr>
            <th>{t("leads.modalTableHeaderKey")}</th>
            <th>{t("leads.modalTableHeaderValue")}</th>
          </tr>
        </thead>
        <tbody className={styles.TableBody}>{dataList}</tbody>
      </table>
    );
  }

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
        <li className={styles.List} key={index}>
          {keysToDisplay[index]}: {data[keysToDisplay[index]]}
        </li>
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
    const { t } = this.props;
    return (
      <div>
        <table className={`table-auto ${styles.leadsTable}`}>
          <thead>
            <tr>
              <th>{t("leads.tableHeaderDate")}</th>
              <th>{t("leads.tableHeaderFormGroup")}</th>
              <th>{t("leads.tableHeaderEmail")}</th>
              <th>{t("leads.tableHeaderFormBody")}</th>
            </tr>
          </thead>
          <tbody>
            {this.props.leads.map((data) => {
              return (
                <tr
                  key={`${data.zuid}-${data.dateCreated}`}
                  onClick={() => this.openModalAndUpdateRoute(data)}
                >
                  <td>{data.dateCreated || t("leads.notAvailable")}</td>
                  <td>{data.form || t("leads.notAvailable")}</td>
                  <td>{data.email || t("leads.notAvailable")}</td>
                  <td>{this.renderTableFormData(data.formData, 3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ConfirmDialog
          className={styles.LeadModal}
          open={this.state.modalIsOpen}
          sx={{ width: "100%" }}
          title={
            <div className={styles.ModalContent}>
              {this.state.currentLead ? (
                <ul className={styles.LeadData}>
                  <li>
                    <strong>{t("leads.dateCreated")}</strong>:{" "}
                    {this.state.currentLead.dateCreated}
                  </li>
                  {this.state.currentLead &&
                    this.state.currentLead.formData &&
                    Object.keys(this.state.currentLead.formData).map((key) => {
                      return (
                        <li key={key}>
                          <span className={styles.Key}>{key}:</span>
                          <span className={styles.Value}>
                            {this.state.currentLead.formData[key]}
                          </span>
                        </li>
                      );
                    })}
                </ul>
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
                    onClick={() => {
                      this.setState({
                        modalIsOpen: false,
                      });
                    }}
                    startIcon={<DoDisturbAltIcon />}
                    sx={{ mr: 1 }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    className={styles.btnDanger}
                    disabled={this.state.loading}
                    onClick={() => this.deleteLead(this.state.currentLead.zuid)}
                    startIcon={<DeleteIcon />}
                  >
                    {t("common.delete")}
                  </Button>
                </>
              )}
          </div>
        </ConfirmDialog>
      </div>
    );
  }
}

export default connect((state) => {
  const leads = filterLeadsData(state.leads, state.filter);
  return {
    filter: state.filter,
    leads,
  };
})(withTranslation()(LeadsTable));
