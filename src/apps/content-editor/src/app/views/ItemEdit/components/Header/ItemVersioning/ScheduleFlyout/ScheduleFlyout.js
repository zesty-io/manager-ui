import { Component } from "react";
import moment from "moment-timezone";

import Button from "@mui/material/Button";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import DeleteIcon from "@mui/icons-material/Delete";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeDate } from "@zesty-io/core/FieldTypeDate";

import { FormControl, FormLabel, Autocomplete, TextField } from "@mui/material";

import { publish, unpublish } from "shell/store/content";

const DISPLAY_FORMAT = "MMMM Do YYYY, [at] h:mm a";
const UTC_FORMAT = "YYYY-MM-DD HH:mm:ss";

import styles from "./ScheduleFlyout.less";

/**
Important Notes!!!
FieldTypeDate uses react-flatpickr (i.e. Flatpickr) which emits selected dates
as date objects in ISO (i.e. UTC) format. 1 We convert emited date objects
into the local time without timezone information.
Moments are stateful with regards to timezone, utc, etc... so we always create
a new moment from a date string in order to avoid confusion.
**/
export default class ScheduleFlyout extends Component {
  componentDidMount() {
    const userTimezone = moment.tz.guess();
    this.setState({
      scheduling: false,
      userTimezone: userTimezone,
      selectedTimezone: userTimezone,
      selectedTime: moment().format(UTC_FORMAT),
      timezones: moment.tz.names(),
    });
  }

  componentDidUpdate(prevProps) {
    // Resets selectedTime when flyout is toggled
    if (prevProps.isOpen !== this.props.isOpen) {
      this.setState({ selectedTime: moment().format(UTC_FORMAT) });
    }
  }

  handleCancelPublish = () => {
    this.setState({
      scheduling: true,
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
          scheduling: false,
        });
      });
  };

  handleSchedulePublish = () => {
    this.setState({
      scheduling: true,
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
            version: this.props.item.meta.version,
          },
          {
            localTime: tzTime,
            localTimezone: this.state.selectedTimezone,
          }
        )
      )
      .finally(() => {
        this.setState({
          scheduling: false,
        });
      });
  };

  handleChangePublish = (value) => {
    // Convert emited date object into the local time without timezone information
    // moment creates local time objects by default
    const selectedTime = moment(value).format(UTC_FORMAT);
    return this.setState({
      selectedTime,
    });
  };

  handleChangeTimezone = (value) => {
    return this.setState({
      selectedTimezone: value,
    });
  };

  render() {
    return (
      this.props.isOpen && (
        <Modal
          className={styles.Modal}
          type="global"
          open={true}
          onClose={this.props.toggleOpen}
        >
          {this.props.item.scheduling &&
          this.props.item.scheduling.isScheduled ? (
            <>
              <ModalContent>
                <Notice className={styles.Notice}>
                  New versions can not be published while there is a version
                  scheduled.
                </Notice>
                <p className={styles.Row}>
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
              </ModalContent>
              <ModalFooter className={styles.ModalFooter}>
                <Button
                  variant="contained"
                  onClick={this.props.toggleOpen}
                  startIcon={<DoDisturbAltIcon />}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  data-cy="UnschedulePublishButton"
                  disabled={this.state.scheduling}
                  onClick={this.handleCancelPublish}
                  startIcon={<DeleteIcon />}
                >
                  Unschedule Version&nbsp;
                  {this.props.item.scheduling.version}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalContent>
                <div className={styles.Row}>
                  <FormControl fullWidth>
                    <FormLabel>Timezone where this will be published</FormLabel>
                    <Autocomplete
                      name="selectedTimezone"
                      size="small"
                      disableClearable
                      renderInput={(params) => <TextField {...params} />}
                      value={this.state.selectedTimezone}
                      onChange={(_, value) => this.handleChangeTimezone(value)}
                      options={this.state.timezones}
                    />
                  </FormControl>
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
                  variant="contained"
                  className={styles.Cancel}
                  id="SchedulePublishClose"
                  onClick={this.props.toggleOpen}
                  startIcon={<DoDisturbAltIcon />}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  type="save"
                  data-cy="SchedulePublishButton"
                  onClick={this.handleSchedulePublish}
                  disabled={this.state.scheduling}
                  startIcon={<CalendarMonthIcon />}
                >
                  Schedule Publishing Version {this.props.item.meta.version}
                </Button>
              </ModalFooter>
            </>
          )}
        </Modal>
      )
    );
  }
}
