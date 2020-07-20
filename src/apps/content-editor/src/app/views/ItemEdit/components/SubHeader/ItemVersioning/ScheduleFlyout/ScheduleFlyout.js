import React, { Component, Fragment } from "react";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faTimesCircle,
  faCalendar,
  faCalendarPlus,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeDate } from "@zesty-io/core/FieldTypeDate";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";

import { publish, unpublish } from "shell/store/content";
import { notify } from "shell/store/notifications";

const DISPLAY_FORMAT = "MMMM Do YYYY, [at] h:mm a";
const UTC_FORMAT = "YYYY-MM-DD HH:mm:ss";

/**
Important Notes!!!

FieldTypeDate uses react-flatpickr (i.e. Flatpickr) which emits selected dates
as date objects in ISO (i.e. UTC) format. 1 We convert emited date objects
into the local time without timezone information.

Moments are stateful with regards to timezone, utc, etc... so we always create
a new moment from a date string in order to avoid confusion.
**/
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

  handleChangePublish = (name, value) => {
    // Convert emited date object into the local time without timezone information
    // moment creates local time objects by default
    const selectedTime = moment(value).format(UTC_FORMAT);
    return this.setState({
      selectedTime
    });
  };

  handleChangeTimezone = (name, value) => {
    return this.setState({
      selectedTimezone: value
    });
  };

  render() {
    return (
      this.props.isOpen &&
      (this.props.item.scheduling && this.props.item.scheduling.isScheduled ? (
        <section className={styles.Flyout}>
          <Card className={styles.Card}>
            <CardHeader>
              <FontAwesomeIcon icon={faCalendar} />
              &nbsp;Scheduled Publishing
            </CardHeader>
            <CardContent>
              <p className={styles.Warn}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <strong>
                  New versions can not be published while there is a version
                  scheduled.
                </strong>
              </p>
              <p>
                Version {this.props.item.scheduling.version} is scheduled to
                publish on{" "}
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
            </CardContent>
            <CardFooter>
              <Button
                kind="secondary"
                disabled={this.state.scheduling}
                onClick={this.handleCancelPublish}
              >
                <FontAwesomeIcon icon={faBan} />
                &nbsp;Cancel Publishing Version&nbsp;
                {this.props.item.scheduling.version}
              </Button>
              <Button kind="cancel" onClick={this.props.toggleOpen}>
                <FontAwesomeIcon icon={faTimesCircle} />
                &nbsp;Close
              </Button>
            </CardFooter>
          </Card>
        </section>
      ) : (
        <section className={styles.Flyout}>
          <Card className={styles.Card}>
            <CardHeader>Schedule Publishing</CardHeader>
            <CardContent>
              <div className={styles.row}>
                <FieldTypeDropDown
                  label="Timezone where this will be published"
                  name="selectedTimezone"
                  onChange={this.handleChangeTimezone}
                  value={this.state.selectedTimezone}
                  options={this.state.timezones}
                />
              </div>
              <div className={styles.row}>
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
            </CardContent>
            <CardFooter className={styles.CardFooter}>
              <Button
                kind="save"
                id="SchedulePublishButton"
                onClick={this.handleSchedulePublish}
                disabled={this.state.scheduling}
              >
                <FontAwesomeIcon icon={faCalendarPlus} /> Schedule Publishing
                Version {this.props.item.meta.version}
              </Button>
              <Button kind="cancel" onClick={this.props.toggleOpen}>
                <FontAwesomeIcon icon={faTimesCircle} /> Close
              </Button>
            </CardFooter>
          </Card>
        </section>
      ))
    );
  }
}
