import React from "react";
import { connect } from "react-redux";
import { createBrowserHistory } from "history";

import { Button } from "@zesty-io/core/Button";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { deleteLead } from "../../../store/leads";
import * as FilterService from "../../views/Leads/LeadFilter.service";

function filterLeadsData(leads, filter) {
  let filteredLeads = FilterService.filterByFormGroup(leads, filter);
  filteredLeads = FilterService.filterByDate(filteredLeads, filter);
  filteredLeads = FilterService.filterByFuzzyText(filteredLeads, filter);
  return filteredLeads;
}

import styles from "./LeadsTable.less";
export default connect(state => {
  return {
    filter: state.filter,
    leads: filterLeadsData(state.leads, state.filter),
    loading: false
  };
})(
  class LeadsTable extends React.Component {
    history = createBrowserHistory();

    constructor(props) {
      super(props);

      this.props = props;
      this.state = {
        currentLead: null, // The current lead being displayed in the modal
        leads: props.leads, // The full list of leads being displayed in the table
        loading: false, // Whether a request is being processed
        modalIsOpen: false // Whether the modal is open (TRUE) or not (FALSE)
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
        modalIsOpen: false
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
        const currentLead = this.state.leads.find(
          lead => lead.zuid === currentLeadZuid
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
    deleteLead = leadZuid => {
      this.setState({ loading: true });
      this.props.dispatch(deleteLead(leadZuid));
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
    openModalAndUpdateRoute = lead => {
      this.history.push(`#!?lead=${lead.zuid}`);
      this.setState({
        currentLead: lead,
        modalIsOpen: true
      });
    };

    /**
     * Renders all of the form data of the lead
     *
     * Used in the Modal
     * @param {FormData} data The Lead's formData object
     */
    renderModalFormData(data) {
      const keysInData = Object.keys(data);
      const keysToDisplay = this.generateFormDataKeysToDisplay(keysInData);
      const dataList = keysToDisplay.map((key, index) => {
        return (
          <tr key={index}>
            <td className="border p-1">{keysToDisplay[index]}</td>
            <td className="border p-1">{data[keysToDisplay[index]]}</td>
          </tr>
        );
      });
      return (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="border p-1">Key</th>
              <th className="border p-1">Value</th>
            </tr>
          </thead>
          <tbody>{dataList}</tbody>
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
        <ul className="pl-5 list-disc">
          {dataList}
          {hasMoreFields}
        </ul>
      );
    }

    render() {
      return (
        <div>
          <table className={`table-auto ${styles.leadsTable}`}>
            <thead>
              <tr>
                <th>Date (system)</th>
                <th>Form Group</th>
                <th>Email</th>
                <th>Form Body</th>
              </tr>
            </thead>
            <tbody>
              {this.props.leads.map(data => {
                return (
                  <tr
                    key={data.zuid}
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
          </table>
          <Modal
            onClose={this.closeModalAndUpdateRoute}
            open={this.state.modalIsOpen}
          >
            <ModalContent>
              {this.state.currentLead ? (
                <div>
                  <p className="mb-2">
                    <strong>Date Created</strong>:{" "}
                    {this.state.currentLead.dateCreated}
                  </p>
                  <p className="mb-1">
                    <strong>Lead data</strong>:
                  </p>
                  {this.renderModalFormData(this.state.currentLead.formData)}
                </div>
              ) : (
                ""
              )}
            </ModalContent>
            <ModalFooter>
              {this.state.currentLead &&
              this.props.leads.find(
                lead => lead.zuid === this.state.currentLead.zuid
              ) ? (
                <Button
                  className={styles.btnDanger}
                  disabled={this.state.loading}
                  text="Delete"
                  onClick={() => this.deleteLead(this.state.currentLead.zuid)}
                />
              ) : (
                <p>This lead has been deleted.</p>
              )}
            </ModalFooter>
          </Modal>
        </div>
      );
    }
  }
);
