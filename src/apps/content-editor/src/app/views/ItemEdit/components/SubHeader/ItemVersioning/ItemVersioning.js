import React from "react";

import { publishItem } from "../../../../../../store/contentModelItems";
import { notify } from "shell/store/notifications";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";

import { ScheduleFlyout } from "./ScheduleFlyout";
import { VersionSelector } from "./VersionSelector";

import styles from "./ItemVersioning.less";
export class ItemVersioning extends React.PureComponent {
  state = {
    ScheduleFlyout: false,
    publishing: false
  };

  handlePublish = () => {
    this.setState({
      publishing: true
    });

    this.props
      .dispatch(
        publishItem(this.props.modelZUID, this.props.itemZUID, {
          version_num: this.props.item.meta.version
        })
      )
      .then(() => {
        notify({
          message: `Published version ${this.props.item.meta.version}`,
          kind: "save"
        });
        this.setState({
          publishing: false
        });
      })
      .catch(() => {
        notify({
          message: `Error publishing version ${this.props.item.meta.version}`,
          kind: "error"
        });
        this.setState({
          publishing: false
        });
      });
  };

  handleOpenSchedule = () => {
    this.setState({
      ScheduleFlyout: !this.state.ScheduleFlyout
    });
  };

  handlePublishDisable = () => {
    // disable publish button if the publish request has gone off
    // if the item is dirty and needs to be saved
    // if the item is scheduled to be published
    // if the version being edited has already been published
    return (
      this.state.publishing ||
      this.props.item.dirty ||
      (this.props.item.scheduling && this.props.item.scheduling.isScheduled) ||
      (this.props.item.publishing &&
        this.props.item.publishing.version === this.props.item.meta.version)
    );
  };

  handleScheduleDisable = () => {
    // disable schedule if the item is dirty and needs to be saved
    // if the current version is already published
    return (
      this.props.item.dirty ||
      (this.props.item.publishing &&
        this.props.item.publishing.version === this.props.item.meta.version)
    );
  };

  render() {
    let publishingDisabled = false;
    let schedulingDisabled = false;
    if (this.props.item && this.props.item.web && this.props.item.meta) {
      publishingDisabled = this.handlePublishDisable();
      schedulingDisabled = this.handleScheduleDisable();
    }

    return (
      <ButtonGroup className={styles.Actions}>
        <VersionSelector
          modelZUID={this.props.modelZUID}
          itemZUID={this.props.itemZUID}
        />

        {this.props.user.permissions.can_publish && (
          <ButtonGroup className={styles.Publish}>
            <Button
              id="PublishButton"
              kind="secondary"
              disabled={publishingDisabled || false}
              onClick={this.handlePublish}
            >
              Publish Version {this.props.item.meta.version}
            </Button>
            <Button
              id="PublishScheduleButton"
              className={`${styles.clock} ${
                this.props.item.scheduling &&
                this.props.item.scheduling.isScheduled
                  ? styles.Scheduled
                  : ""
              }
              `}
              kind={this.state.ScheduleFlyout ? "tertiary" : "secondary"}
              disabled={schedulingDisabled || false}
              onClick={this.handleOpenSchedule}
            >
              <i className="fa fa-calendar" aria-hidden="true" />
            </Button>
            <ScheduleFlyout
              isOpen={this.state.ScheduleFlyout}
              item={this.props.item}
              dispatch={this.props.dispatch}
              toggleOpen={this.handleOpenSchedule}
            />
          </ButtonGroup>
        )}

        <Button
          kind="save"
          disabled={this.props.saving || !this.props.item.dirty}
          onClick={this.props.onSave}
          id="SaveItemButton"
        >
          {this.props.saving ? (
            <i className={`fa fa-spinner fa-spin`} aria-hidden="true" />
          ) : (
            <i className="fas fa-save" aria-hidden="true" />
          )}
          Save New Version&nbsp;
          <small>({this.props.OS === "win" ? "CTRL" : "CMD"} + S)</small>
        </Button>
      </ButtonGroup>
    );
  }
}
