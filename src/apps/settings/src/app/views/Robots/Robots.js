import React, { Component } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { notify } from "shell/store/notifications";

import styles from "./Robots.less";
export default connect(state => {
  return {
    domains: state.instance.domains,
    platform: state.platform
  };
})(
  class Robots extends Component {
    constructor(props) {
      super(props);

      this.state = {
        loading: false,
        robots_on: {
          admin: false,
          category: "general",
          dataType: "checkbox",
          key: "robots_on",
          keyFriendly: "Search Engine Crawlable?",
          parsleyAccess: false,
          tips:
            "Search engines will have permission to index each page of your site allowing for greater visibility"
        },
        robots_text: {
          admin: false,
          category: "general",
          dataType: "textarea",
          key: "robots_text",
          keyFriendly: "Custom Robots.txt Content",
          parsleyAccess: false
        },
        robotsUrl: `https://${props.domains[0].domain}/robots.txt`
      };
    }

    componentDidMount() {
      window.addEventListener("keydown", this.handleKeyDown);

      request(`${CONFIG.API_INSTANCE}/env/settings`).then(res => {
        const robots_on = res.data.find(setting => setting.key === "robots_on");
        const robots_text = res.data.find(
          setting => setting.key === "robots_text"
        );

        // Merge current local state with incoming remote state
        this.setState({
          robots_text: {
            ...this.state.robots_text,
            ...robots_text
          },
          robots_on: {
            ...this.state.robots_on,
            ...robots_on,

            // We require this to be a number to properly convert to a boolean for the FeildTypeBinary compnent
            value: Number(robots_on.value)
          }
        });
      });
    }

    componentWillUnmount() {
      window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown = evt => {
      if (
        ((props.platform.isMac && evt.metaKey) ||
          (!props.platform.isMac && evt.ctrlKey)) &&
        evt.key == "s"
      ) {
        evt.preventDefault();
        this.handleSave();
      }
    };

    handleRobotsOn = value => {
      this.setState({
        robots_on: {
          ...this.state.robots_on,
          value
        }
      });
    };

    handleRobotsText = value => {
      this.setState({
        robots_text: {
          ...this.state.robots_text,
          value
        }
      });
    };

    handleSave = () => {
      this.setState({
        loading: true
      });

      const robotsOn = this.makeRequest({
        ...this.state.robots_on,
        value: String(this.state.robots_on.value) // The API requires this as a string
      });
      const robotsText = this.makeRequest(this.state.robots_text);

      Promise.all([robotsOn, robotsText])
        .then(res => {
          this.props.dispatch(
            notify({
              kind: "success",
              message: "robots.txt file settings have been updated"
            })
          );
          this.setState({
            loading: false
          });
        })
        .catch(err => {
          console.log(err);
          this.props.dispatch(
            notify({
              kind: "warn",
              message: `Failed saving robots.txt settings. ${err}`
            })
          );
          this.setState({
            loading: false
          });
        });
    };

    makeRequest = data => {
      return request(
        `${CONFIG.API_INSTANCE}/env/settings${
          data.ZUID ? `/${data.ZUID}` : ""
        }`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          method: data.ZUID ? "PUT" : "POST",
          body: JSON.stringify(data)
        }
      );
    };

    render() {
      return (
        <WithLoader
          condition={this.state.robots_on.ZUID}
          message="Finding robots.txt settings"
        >
          <div className={styles.Robots}>
            <h2 className={styles.display}>
              <span className="pictos headingIcon">W</span> Robots.txt Editor
            </h2>

            <div className={styles.Row}>
              <Notice>
                <p>
                  Changes will not be reflected until a publish event occurs.
                </p>
              </Notice>
              <Notice>
                <p>
                  Stage/preview urls ALWAYS have robots.txt off to avoid being
                  crawled by search engines.
                </p>
              </Notice>
            </div>

            <div className={styles.Row}>
              <FieldTypeBinary
                name="settings[general][robots_on]"
                label={this.state.robots_on.keyFriendly}
                tooltip={this.state.robots_on.tips}
                value={Boolean(this.state.robots_on.value)}
                offValue="No"
                onValue="Yes"
                onChange={this.handleRobotsOn}
              />
            </div>

            <div className={cx(styles.IframeWrapper, styles.Row)}>
              <h2>
                <Url href={this.state.robotsUrl} target="_blank">
                  {this.state.robotsUrl}
                </Url>
              </h2>
              <iframe
                className={styles.Iframe}
                src={`${this.state.robotsUrl}?q=${Math.random()
                  .toString(36)
                  .substring(2, 15)}`}
              ></iframe>
            </div>

            <div className={styles.Row}>
              <FieldTypeTextarea
                className={styles.CustomRules}
                name="settings[general][robots_text]"
                label={this.state.robots_text.keyFriendly}
                tooltip={this.state.robots_text.tips}
                onChange={this.handleRobotsText}
                defaultValue={this.state.robots_text.value}
              />
            </div>

            <Button
              kind="save"
              className={styles.SaveBtn}
              onClick={this.handleSave}
              disabled={this.state.loading}
            >
              {this.state.loading ? (
                <i className="fas fa-spinner"></i>
              ) : (
                <i className="fas fa-save"></i>
              )}
              Save Settings
            </Button>
          </div>
        </WithLoader>
      );
    }
  }
);
