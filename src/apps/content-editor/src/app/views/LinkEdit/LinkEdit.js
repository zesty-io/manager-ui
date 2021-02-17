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
      set_name: "zesty_link",
      type: "internal",
      parent_zuid: "0",
      external: "",
      seo_link_title: "",
      target: false,
      rel: false,
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
        set_name: "zesty_link",
        parent_zuid: "0",
        external: "",
        seo_link_title: "",
        target: false,
        rel: false,
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

    return request(
      `${CONFIG.LEGACY_SITES_SERVICE}/ajax/content_call.ajax.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: `hash[0]=content&hash[1]=${linkZUID}`
      }
    )
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
            if (res.znode.parent_zuid != "0" && res.znode.parent_zuid) {
              let parent = this.props.items[res.znode.parent_zuid];

              if (!parent || !parent.meta.ZUID) {
                this.search(res.znode.parent_zuid);
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
            if (res.znode.type === "internal" && res.znode.path_part) {
              let link = this.props.items[res.znode.path_part];
              if (!link || !link.meta.ZUID) {
                this.search(res.znode.path_part);
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

            this.setState({
              zuid: res.znode.zuid,
              set_name: res.znode.set_name,
              type: res.znode.type,
              parent_zuid: res.znode.parent_zuid,
              seo_link_title: res.znode.seo_link_title,
              target: res.znode.target == null ? false : true,
              rel: res.znode.rel == null ? false : true,
              [res.znode.type]: res.znode.path_part
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

    return request(
      `${CONFIG.LEGACY_SITES_SERVICE}/ajax/process_link.ajax.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body
      }
    )
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

  search = zuid => {
    return request(`${CONFIG.service.instance_api}/search/items?q=${zuid}`)
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
            <CardContent className={styles.CardContent}>
              <FieldTypeInternalLink
                className={styles.Row}
                name="parent_zuid"
                label="Select a parent for your link"
                value={this.state.parent_zuid}
                options={this.state.internalLinkOptions.filter(
                  op => op.value !== this.state.internal
                )}
                onChange={this.onChange}
                onSearch={this.search}
              />

              {this.state.type === "internal" ? (
                <FieldTypeInternalLink
                  className={styles.Row}
                  name="internal"
                  label="Select an item to link to"
                  value={this.state.internal}
                  options={this.state.internalLinkOptions}
                  onChange={this.onChange}
                  onSearch={this.search}
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
