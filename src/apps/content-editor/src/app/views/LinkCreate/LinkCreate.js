import React, { Component } from "react";
import { connect } from "react-redux";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Option } from "@zesty-io/core/Select";
import { Input } from "@zesty-io/core/Input";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkSquareAlt,
  faLink
} from "@fortawesome/free-solid-svg-icons";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./LinkCreate.less";
export const LinkCreate = connect((state, props) => {
  // NOTE: I don't think this compoentn needs to be connected
  return {};
})(
  class LinkCreate extends Component {
    constructor(props) {
      super(props);

      this.state = {
        type: "internal",
        parentZUID: "0",
        label: "",
        metaTitle: "",
        target: null,
        relNoFollow: false,
        targetBlank: false,
        internalLinkOptions: []
      };
    }

    saveLink = () => {
      this.setState({
        saving: true
      });

      const source = [];
      if (this.state.relNoFollow) {
        source.push("rel:true");
      }
      if (this.state.targetBlank) {
        source.push("target:_blank");
      }

      return request(`${CONFIG.API_INSTANCE}/content/links`, {
        method: "POST",
        json: true,
        body: {
          type: this.state.type,
          parentZUID: this.state.parentZUID,
          label: this.state.label,
          metaTitle: this.state.metaTitle,
          source: source.join(";"),
          target: this.state.target
        }
      })
        .then(res => {
          this.setState({ saving: false });
          if (res.error) {
            notify({
              message: `Failure creating link: ${res.message}`,
              kind: "error"
            });
          } else {
            // this is a successful save
            // message and redirect to new item here
            notify({
              message: "Successfully created link",
              kind: "save"
            });

            window.location = `/content/link/${res.data.ZUID}`;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ saving: false });
        });
    };

    handleSearch = term => {
      return request(`${CONFIG.API_INSTANCE}/search/items?q=${term}`)
        .then(res => {
          if (res.status === 200) {
            const searchResults = res.data
              .filter(item => item.web.path)
              .map(item => {
                return {
                  value: item.meta.ZUID,
                  text: item.web.path
                };
              });

            const dedupeOptions = [
              ...this.state.internalLinkOptions,
              ...searchResults
            ].reduce((acc, el) => {
              if (!acc.find(opt => opt.value === el.value)) {
                acc.push(el);
              }

              return acc;
            }, []);

            this.setState({
              internalLinkOptions: dedupeOptions
            });
          } else {
            return notify({
              message: `Failure searching: ${res.error}`,
              kind: "error"
            });
          }
        })
        .catch(err => {
          console.error("LinkCreate:handleSearch", err);
        });
    };

    onChange = (value, name) => {
      this.setState({
        [name]: value
      });
    };

    render() {
      return (
        <section className={styles.Editor}>
          <Card className={styles.LinkCreate}>
            <CardHeader className={styles.EditorHeader}>
              <FieldTypeDropDown
                label="Select link type"
                name="type"
                value={this.state.type}
                onChange={this.onChange}
              >
                <Option
                  className={styles.Icon}
                  value="internal"
                  component={
                    <React.Fragment>
                      <FontAwesomeIcon icon={faLink} />
                      &nbsp;Internal Link
                    </React.Fragment>
                  }
                />
                <Option
                  className={styles.Icon}
                  value="external"
                  component={
                    <React.Fragment>
                      <FontAwesomeIcon icon={faExternalLinkSquareAlt} />
                      &nbsp;External Link
                    </React.Fragment>
                  }
                />
              </FieldTypeDropDown>
            </CardHeader>

            <CardContent>
              <FieldTypeInternalLink
                className={styles.Row}
                name="parentZUID"
                label="Select a parent for your link"
                value={this.state.parentZUID}
                options={this.state.internalLinkOptions}
                onChange={this.onChange}
                onSearch={this.handleSearch}
              />

              {this.state.type === "internal" ? (
                <FieldTypeInternalLink
                  className={styles.Row}
                  name="target"
                  label="Select an item to link to"
                  value={this.state.target}
                  options={this.state.internalLinkOptions}
                  onChange={this.onChange}
                  onSearch={this.handleSearch}
                />
              ) : (
                <FieldTypeUrl
                  className={styles.Row}
                  label="Provide an external URL to link to"
                  name="target"
                  onChange={this.onChange}
                />
              )}

              <FieldTypeText
                className={styles.Row}
                label="Link title"
                name="metaTitle"
                value={this.state.metaTitle}
                onChange={value => {
                  this.onChange(value, "label");
                  this.onChange(value, "metaTitle");
                }}
              />

              <label className={styles.Checkboxes}>
                <Input
                  type="checkbox"
                  name="targetBlank"
                  checked={this.state.targetBlank}
                  onClick={evt => {
                    this.onChange(evt.target.checked, "targetBlank");
                  }}
                />
                target = _blank
              </label>
              <label className={styles.Checkboxes}>
                <Input
                  type="checkbox"
                  name="relNoFollow"
                  checked={this.state.relNoFollow}
                  onClick={evt => {
                    this.onChange(evt.target.checked, "relNoFollow");
                  }}
                />
                rel = nofollow
              </label>
            </CardContent>
            <CardFooter>
              <Button
                id="CreateLinkButton"
                disabled={this.state.saving}
                kind="save"
                onClick={this.saveLink}
              >
                Create Link
              </Button>
            </CardFooter>
          </Card>
        </section>
      );
    }
  }
);
