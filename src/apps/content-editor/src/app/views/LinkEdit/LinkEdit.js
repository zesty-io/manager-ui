import React, { Component } from "react";
import { connect } from "react-redux";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Input } from "@zesty-io/core/Input";
import { Button } from "@zesty-io/core/Button";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./LinkEdit.less";
class LinkEdit extends Component {
  __mounted = false;

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
      internalLinkOptions: [],
      linkZUID: this.props.linkZUID,
      loading: false
    };
  }

  componentDidMount() {
    this.__mounted = true;
    this.fetchLink(this.props.linkZUID);
  }
  componentWillUnmount() {
    this.__mounted = false;
  }

  componentDidUpdate() {
    if (this.props.linkZUID !== this.state.linkZUID) {
      this.setState({
        type: "internal",
        parentZUID: "0",
        label: "",
        metaTitle: "",
        target: null,
        relNoFollow: false,
        targetBlank: false,
        internalLinkOptions: [],
        linkZUID: this.props.linkZUID,
        loading: false
      });
      this.fetchLink(this.props.linkZUID);
    }
  }

  fetchLink = linkZUID => {
    this.setState({
      loading: true
    });

    return request(`${CONFIG.API_INSTANCE}/content/links/${linkZUID}`)
      .then(res => {
        if (this.__mounted) {
          this.setState({
            loading: false
          });

          if (res.error) {
            notify({
              message: `Failure loading link: ${res.message}`,
              kind: "error"
            });
          } else {
            // 0 indicates a top level menu link, nothing to resolve
            // otherwise if a parent zuid value exists resolve it's data
            if (res.data.parentZUID !== "0" && res.data.parentZUID) {
              let parent = this.props.items[res.data.parentZUID];

              if (!parent || !parent.meta.ZUID) {
                this.search(res.data.parentZUID);
              } else {
                this.setState({
                  internalLinkOptions: [
                    ...this.state.internalLinkOptions,
                    {
                      value: parent.meta.ZUID,
                      text: parent.web.path
                    }
                  ]
                });
              }
            }

            // Internal links store the linked zuid on the path_part
            if (res.data.type === "internal" && res.data.target) {
              let link = this.props.items[res.data.target];
              if (!link || !link.meta.ZUID) {
                this.search(res.data.target);
              } else {
                this.setState({
                  internalLinkOptions: [
                    ...this.state.internalLinkOptions,
                    {
                      value: link.meta.ZUID,
                      text: link.web.path
                    }
                  ]
                });
              }
            }

            let relNoFollow = false;
            let targetBlank = false;
            res.data.source.split(";").forEach(sourceField => {
              if (sourceField === "rel:true") {
                relNoFollow = true;
              } else if (sourceField === "target:_blank") {
                targetBlank = true;
              }
            });

            this.setState({
              ZUID: res.data.ZUID,
              type: res.data.type,
              parentZUID: res.data.parentZUID,
              label: res.data.label,
              metaTitle: res.data.metaTitle || res.data.label,
              targetBlank,
              relNoFollow,
              target: res.data.target
            });
          }
        }
      })
      .catch(err => {
        console.error(err);
        notify({
          message: "There was an issue loading this link",
          kind: "error"
        });
        this.setState({
          loading: false
        });
      });
  };

  saveLink = () => {
    this.setState({ saving: true });

    const source = [];
    if (this.state.relNoFollow) {
      source.push("rel:true");
    }
    if (this.state.targetBlank) {
      source.push("target:_blank");
    }

    const params = {
      ZUID: this.state.ZUID,
      type: this.state.type,
      parentZUID: this.state.parentZUID,
      label: this.state.label,
      metaTitle: this.state.metaTitle,
      source: source.join(";"),
      target: this.state.target
    };

    return request(`${CONFIG.API_INSTANCE}/content/links/${params.ZUID}`, {
      method: "PUT",
      json: true,
      body: params
    })
      .then(res => {
        if (res.error) {
          notify({
            message: `Failure creating link: ${res.message}`,
            kind: "error"
          });
        } else {
          this.setState({ saving: false });
          notify({ message: "Saved link", kind: "save" });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({ saving: false });
        notify({ message: "Error saving link", kind: "error" });
      });
  };

  search = term => {
    return request(`${CONFIG.API_INSTANCE}/search/items?q=${term}`)
      .then(res => {
        if (res.status !== 200) {
          notify({
            message: "Error fetching API",
            kind: "error"
          });
          throw res;
        }

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

        return res;
      })
      .catch(err => {
        console.error(err);
        notify({
          message: "Failed loading API",
          kind: "error"
        });
      });
  };

  onChange = (value, name) => {
    console.log("onChange", name, value);
    this.setState({
      [name]: value
    });
  };

  render() {
    return (
      <section className={styles.Editor}>
        <WithLoader condition={!this.state.loading} message="Loading Link">
          <Card className={styles.LinkEdit}>
            <CardHeader className={styles.EditorHeader}>
              {this.state.type === "internal" && <h2>Internal Link</h2>}
              {this.state.type === "external" && <h2>External Link</h2>}
            </CardHeader>
            <CardContent className={styles.CardContent}>
              <FieldTypeInternalLink
                className={styles.Row}
                name="parentZUID"
                label="Select a parent for your link"
                value={this.state.parentZUID}
                options={this.state.internalLinkOptions.filter(
                  op => op.value !== this.state.target
                )}
                onChange={this.onChange}
                onSearch={this.search}
              />

              {this.state.type === "internal" ? (
                <FieldTypeInternalLink
                  className={styles.Row}
                  name="target"
                  label="Select an item to link to"
                  value={this.state.target}
                  options={this.state.internalLinkOptions}
                  onChange={this.onChange}
                  onSearch={this.search}
                />
              ) : (
                <FieldTypeUrl
                  className={styles.Row}
                  label="Provide an external URL to link to"
                  name="target"
                  value={this.state.target}
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
                  name="rel"
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
                kind="save"
                disabled={this.state.saving}
                onClick={this.saveLink}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </WithLoader>
      </section>
    );
  }
}

export default connect((state, props) => {
  return {
    linkZUID: props.match.params.linkZUID,
    items: state.content
  };
})(LinkEdit);
