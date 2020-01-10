import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import debounce from "lodash.debounce";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { FieldTypeInternalLink } from "@zesty-io/core/FieldTypeInternalLink";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { FieldTypeUrl } from "@zesty-io/core/FieldTypeUrl";
import { Input } from "@zesty-io/core/Input";
import { Button } from "@zesty-io/core/Button";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";

import styles from "./LinkEdit.less";
class LinkEdit extends Component {
  __mounted = false;

  constructor(props) {
    super(props);

    this.state = {
      set_name: "zesty_link",
      type: "internal",
      parent_zuid: "0",
      external: "",
      seo_link_title: "",
      target: false,
      rel: false,
      internalLinkOptions: [
        {
          value: "0",
          html: "<i class='fa fa-home'></i>&nbsp;/"
        }
      ],
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
        set_name: "zesty_link",
        parent_zuid: "0",
        external: "",
        seo_link_title: "",
        target: false,
        rel: false,
        internalLinkOptions: [
          {
            value: "0",
            html: "<i class='fa fa-home'></i>&nbsp;/"
          }
        ],
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
    return request(`${CONFIG.service.manager}/ajax/content_call.ajax.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `hash[0]=content&hash[1]=${linkZUID}`
    })
      .then(res => {
        if (this.__mounted) {
          if (res.error) {
            notify({
              message: `Failure updating link: ${res.message}`,
              kind: "error"
            });
          } else {
            this.setState({
              zuid: res.znode.zuid,
              set_name: res.znode.set_name,
              type: res.znode.type,
              parent_zuid: res.znode.parent_zuid,
              seo_link_title: res.znode.seo_link_title,
              target: res.znode.target == null ? false : true,
              rel: res.znode.rel == null ? false : true,
              [res.znode.type]: res.znode.path_part,
              loading: false
            });
            // take the parentZUID and see if it's in the store
            if (this.props.items[res.znode.parent_zuid]) {
              const parent = this.props.items[res.znode.parent_zuid];
              this.setState({
                internalLinkOptions: [
                  ...this.state.internalLinkOptions,
                  {
                    value: parent.meta.ZUID,
                    text: parent.web.metaTitle
                  }
                ]
              });
            } else {
              // if it isnt we have to search for it
              this.handleSearch(res.znode.parent_zuid);
            }
            // take the internal link ZUID and see if it's in the store
            if (res.znode.type === "internal") {
              const linkValue = this.props.items[res.znode.path_part];
              if (!linkValue) {
                // if it isnt we have to search for it
                this.resolveLink(res.znode.path_part);
              } else {
                this.setState({
                  internalLinkOptions: [
                    ...this.state.internalLinkOptions,
                    {
                      value: linkValue.meta.ZUID,
                      text: linkValue.web.metaTitle
                    }
                  ]
                });
              }
            }
          }
        }
      })
      .catch(err => {
        notify({
          message: "Something went wrong fetching your data",
          kind: "error"
        });
        this.setState({
          loading: false
        });
      });
  };

  saveLink = () => {
    this.setState({ saving: true });

    const params = {
      zuid: this.state.zuid,
      set_name: this.state.set_name,
      type: this.state.type,
      parent_zuid: this.state.parent_zuid,
      seo_link_title: this.state.seo_link_title,
      target: this.state.target ? "_blank" : null,
      rel: this.state.rel ? "nofollow" : null,
      // send internal or external key with that value from store
      [this.state.type]: this.state[this.state.type]
    };

    // Convert to urlencoded
    const body = Object.keys(params)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");

    return request(`${CONFIG.service.manager}/ajax/process_link.ajax.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body
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
        notify({ message: "Error saving link", kind: "error" });
        this.setState({ saving: false });
      });
  };

  handleSearch = debounce(term => {
    return request(`${CONFIG.API_INSTANCE}/search/items?q=${term}`)
      .then(res => {
        // TODO: filter out duplicates
        if (res.status === 400) {
          notify({
            message: `Failure searching: ${res.message}`,
            kind: "error"
          });
        } else {
          const internalLinkOptions = [
            ...this.state.internalLinkOptions,
            ...res.data.map(item => {
              return {
                value: item.meta.ZUID,
                text: item.web.metaTitle
              };
            })
          ];

          this.setState({
            internalLinkOptions
          });
        }
      })
      .catch(err => {
        console.error("LinkCreate:handleSearch", err);
      });
  }, 500);

  resolveLink = term => {
    return request(`${CONFIG.API_INSTANCE}/search/items?q=${term}`)
      .then(res => {
        // TODO: filter out duplicates
        if (res.status === 400) {
          notify({
            message: `Failure searching: ${res.message}`,
            kind: "error"
          });
        } else {
          const internalLinkOptions = [
            ...this.state.internalLinkOptions,
            ...res.data.map(item => {
              return {
                value: item.meta.ZUID,
                text: item.web.metaTitle
              };
            })
          ];

          this.setState({
            internalLinkOptions
          });
        }
      })
      .catch(err => {
        console.error("LinkCreate:handleSearch", err);
      });
  };

  onChange = (name, value) => {
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
            <CardContent>
              <FieldTypeInternalLink
                className={styles.Row}
                name="parent_zuid"
                label="Select a parent for your link"
                value={this.state.parent_zuid}
                options={this.state.internalLinkOptions.filter(
                  op => op.value !== this.state.internal
                )}
                onChange={this.onChange}
                onSearch={this.handleSearch}
              />

              {this.state.type === "internal" ? (
                <FieldTypeInternalLink
                  className={styles.Row}
                  name="internal"
                  label="Select an item to link to"
                  value={this.state.internal}
                  options={this.state.internalLinkOptions}
                  onChange={this.onChange}
                  onSearch={this.handleSearch}
                />
              ) : (
                <FieldTypeUrl
                  className={styles.Row}
                  label="Provide an external URL to link to"
                  name="external"
                  value={this.state.external}
                  onChange={this.onChange}
                />
              )}

              <FieldTypeText
                className={styles.Row}
                label="Link title"
                name="seo_link_title"
                value={this.state.seo_link_title}
                onChange={this.onChange}
              />
              <label className={styles.Checkboxes}>
                <Input
                  type="checkbox"
                  name="target"
                  checked={this.state.target}
                  onClick={evt => {
                    this.onChange("target", evt.target.checked);
                  }}
                />
                target = _blank
              </label>
              <label className={styles.Checkboxes}>
                <Input
                  type="checkbox"
                  name="rel"
                  checked={this.state.rel}
                  onClick={evt => {
                    this.onChange("rel", evt.target.checked);
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
    items: state.contentModelItems
  };
})(LinkEdit);
