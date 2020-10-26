import React, { Component } from "react";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faTimesCircle,
  faCalendar,
  faCalendarPlus,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { FieldTypeDate } from "@zesty-io/core/FieldTypeDate";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { publish, unpublish } from "shell/store/content";

const DISPLAY_FORMAT = "MMMM Do YYYY, [at] h:mm a";
const UTC_FORMAT = "YYYY-MM-DD HH:mm:ss";

import styles from "./ScheduleFlyout.less";

export default class ScheduleFlyout extends Component {
  componentDidMount() {
    const userTimezone = moment.tz.guess();
    this.setState({
      scheduling: false,
      userTimezone: userTimezone,
      selectedTimezone: userTimezone,
      selectedTime: moment().format(UTC_FORMAT),
      timezones: moment.tz.names().map((el, i) => {
        return {
          value: el,
          html: el
        };
      })
    });
  }

  handleCancelPublish = () => {
    this.setState({
      scheduling: true
    });

    this.props
      .dispatch(
        unpublish(
          this.props.item.meta.contentModelZUID,
          this.props.item.meta.ZUID,
          this.props.item.scheduling.ZUID,
          { version: this.props.item.scheduling.version }
        )
      )
      .finally(() => {
        this.setState({
          scheduling: false
        });
      });
  };

  handleSchedulePublish = () => {
    this.setState({
      scheduling: true
    });

    // Display timestamp to user in the selected timezone
    const tzTime = moment
      .tz(this.state.selectedTime, this.state.selectedTimezone)
      .format(DISPLAY_FORMAT);

    // Send to API as UTC string
    // Order tz > utc > format is important
    const utcTime = moment
      .tz(this.state.selectedTime, this.state.selectedTimezone)
      .utc()
      .format(UTC_FORMAT);

    this.props
      .dispatch(
        publish(
          this.props.item.meta.contentModelZUID,
          this.props.item.meta.ZUID,
          {
            publishAt: utcTime,
            version: this.props.item.meta.version
          },
          {
            localTime: tzTime,
            localTimezone: this.state.selectedTimezone
          }
        )
      )
      .finally(() => {
        this.setState({
          scheduling: false
        });
      });
  };

  handleChangePublish = value => {
    // Convert emited date object into the local time without timezone information
    // moment creates local time objects by default
    const selectedTime = moment(value).format(UTC_FORMAT);
    return this.setState({
      selectedTime
    });
  };

  handleChangeTimezone = value => {
    return this.setState({
      selectedTimezone: value
    });
  };

  renderIsScheduled() {
    return (
      <>
        <FontAwesomeIcon icon={faCalendar} />
        &nbsp;Scheduled Publishing
        <ModalContent>
          <p className={styles.Warn}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <strong>
              New versions can not be published while there is a version
              scheduled.
            </strong>
          </p>
          <p>
            Version {this.props.item.scheduling.version} is scheduled to publish
            on{" "}
            <em>
              {/*
            publishAt from API is in UTC.

            Order of moment > utc > local > format is important
            Since the API returns a UTC timestamp we need it in UTC
            before setting it to the users timezone and formatting.

            We can not display it in the selected timezone when it was created because
            that information is not persisted to the API so we always display it after
            the fact in the users current timezone
          */}
              {moment
                .utc(this.props.item.scheduling.publishAt)
                .tz(this.state.userTimezone)
                .format(DISPLAY_FORMAT)}
            </em>{" "}
            in the <em>{this.state.userTimezone}</em> timezone.
          </p>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button
            kind="secondary"
            id="UnschedulePublishButton"
            disabled={this.state.scheduling}
            onClick={this.handleCancelPublish}
          >
            <FontAwesomeIcon icon={faBan} />
            &nbsp;Unschedule Version&nbsp;
            {this.props.item.scheduling.version}
          </Button>
          <Button
            className={styles.Close}
            kind="cancel"
            onClick={this.props.toggleOpen}
          >
            <FontAwesomeIcon icon={faTimesCircle} />
            &nbsp;Close
          </Button>
        </ModalFooter>
      </>
    );
  }
  renderIsNotScheduled() {
    return (
      <>
        <h3>Schedule Publishing</h3>
        <ModalContent>
          <div className={styles.Row}>
            <FieldTypeDropDown
              label="Timezone where this will be published"
              name="selectedTimezone"
              onChange={this.handleChangeTimezone}
              value={this.state.selectedTimezone}
              options={this.state.timezones}
            />
          </div>
          <div className={styles.Row}>
            <FieldTypeDate
              type="date"
              name="publish"
              label="Publish date and time"
              future={true}
              value={this.state.selectedTime}
              datatype={"datetime"}
              onChange={this.handleChangePublish}
            />
          </div>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button
            kind="save"
            id="SchedulePublishButton"
            onClick={this.handleSchedulePublish}
            disabled={this.state.scheduling}
          >
            <FontAwesomeIcon icon={faCalendarPlus} /> Schedule Publishing
            Version {this.props.item.meta.version}
          </Button>
          <Button
            className={styles.Close}
            kind="cancel"
            id="SchedulePublishClose"
            onClick={this.props.toggleOpen}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Close
          </Button>
        </ModalFooter>
      </>
    );
  }

  render() {
    return (
      this.props.isOpen && (
        <section>
          <Modal
            className={styles.Modal}
            type="global"
            open={true}
            onClose={this.props.toggleOpen}
          >
            {this.props.item.scheduling &&
            this.props.item.scheduling.isScheduled
              ? this.renderIsScheduled()
              : this.renderIsNotScheduled()}
          </Modal>
        </section>
      )
    );
  }
}
