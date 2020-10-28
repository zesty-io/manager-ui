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

import { notify } from "shell/store/notifications";

import styles from "./LinkCreate.less";
export const LinkCreate = connect((state, props) => {
  // NOTE: I don't think this compoentn needs to be connected
  return {};
})(
  class LinkCreate extends Component {
    constructor(props) {
      super(props);

      //       set_name: zesty_link
      // zuid: 17-265584-k3dz8l
      // type: internal
      // parent_zuid: 0
      // internal: 7-b939a4-457q19
      // seo_link_title: Internal Link test

      //       set_name: zesty_link
      // zuid: 17-f3362c-2d1j66
      // type: external
      // parent_zuid: 0
      // external: https://zesty.io
      // seo_link_title: External Link test

      // Current Internal Link Creation
      //       set_name: zesty_link
      // zuid: new
      // type: internal
      // parent_zuid: 7-44e368-sbjn9m
      // internal: 7-72f010f-8rjntl
      // seo_link_title: Internal Link 1
      // target: _blank
      // rel: nofollow

      this.state = {
        set_name: "zesty_link",
        type: "internal",
        parent_zuid: "0",
        external: "",
        seo_link_title: "",
        target: "",
        rel: "",

        internalLinkOptions: []
      };
    }

    saveLink = () => {
      const stateData = {
        zuid: "new",
        set_name: this.state.set_name,
        type: this.state.type,
        parent_zuid: this.state.parent_zuid,
        seo_link_title: this.state.seo_link_title,
        target: this.state.target,
        rel: this.state.rel,
        // send internal or external key with that value from store
        [this.state.type]: this.state[this.state.type]
      };
      let data = "";
      // build up a text string for the request body
      Object.entries(stateData).map(([key, value], i) => {
        value && (data += `${key}=${value}&`);
      });
      // trim the ampersand from the end of the string
      const body = data.substr(0, data.length - 1);

      this.setState({
        saving: true
      });

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

            window.location.hash = `#!/content/link/${res.current_znode_id}`;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ saving: false });
        });
    };

    handleSearch = term => {
      return request(`${CONFIG.service.instance_api}/search/items?q=${term}`)
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

    onChange = (name, value) => {
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
                  value="internal"
                  html="<i class='fa fa-link'></i>&nbsp;Internal Link"
                />
                <Option
                  value="external"
                  html="<i class='fas fa-external-link-square-alt'></i>&nbsp;External Link"
                />
              </FieldTypeDropDown>
            </CardHeader>

            <CardContent>
              <FieldTypeInternalLink
                className={styles.Row}
                name="parent_zuid"
                label="Select a parent for your link"
                value={this.state.parent_zuid}
                options={this.state.internalLinkOptions}
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
