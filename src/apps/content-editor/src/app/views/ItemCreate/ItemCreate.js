import React, { Component } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";
import { Divider } from "@zesty-io/core/Divider";

import { Header } from "./Header";
import { Editor } from "../../components/Editor";
import { ItemSettings } from "../ItemEdit/Meta/ItemSettings";
import { DataSettings } from "../ItemEdit/Meta/ItemSettings/DataSettings";

import { fetchFields } from "shell/store/fields";
import { createItem, generateItem, fetchItem } from "shell/store/content";
import { notify } from "shell/store/notifications";

import styles from "./ItemCreate.less";
export default connect((state, props) => {
  const { modelZUID } = props.match.params;
  const itemZUID = `new:${modelZUID}`;

  return {
    platform: state.platform,
    itemZUID,
    modelZUID,
    model: state.models[modelZUID] || {},
    item: state.content[itemZUID] || {},
    instance: state.instance,
    content: state.content,
    fields: Object.keys(state.fields)
      .filter(
        fieldZUID => state.fields[fieldZUID].contentModelZUID === modelZUID
      )
      .map(fieldZUID => state.fields[fieldZUID])
      .sort((a, b) => a.sort - b.sort)
  };
})(
  class ItemCreate extends Component {
    _isMounted = false;

    state = {
      // Track modelZUID for switching between model creation views
      modelZUID: this.props.modelZUID,
      loading: true,
      saving: false
    };

    componentDidMount() {
      this._isMounted = true;
      this.load(this.props.modelZUID);
      window.addEventListener("keydown", this.handleSave);

      if (!Object.keys(this.props.item).length) {
        this.props.dispatch(generateItem(this.props.modelZUID));
      }
    }

    componentWillUnmount() {
      this._isMounted = false;
      window.removeEventListener("keydown", this.handleSave);
    }

    componentDidUpdate() {
      if (this.props.modelZUID !== this.state.modelZUID) {
        this.load(this.props.modelZUID);
        if (!Object.keys(this.props.item).length) {
          this.props.dispatch(generateItem(this.props.modelZUID));
        }
      }
    }

    load = modelZUID => {
      this.setState({
        loading: true,
        modelZUID
      });

      this.props
        .dispatch(fetchFields(modelZUID))
        .then(() => {
          if (this._isMounted) {
            this.setState({
              loading: false
            });
          }
        })
        .catch(err => {
          console.error("ItemCreate:load:error", err);
          if (this._isMounted) {
            this.setState({
              loading: false
            });
          }
          throw err;
        });
    };

    handleSave = evt => {
      if (
        ((this.props.platform.isMac && evt.metaKey) ||
          (!this.props.platform.isMac && evt.ctrlKey)) &&
        evt.key == "s"
      ) {
        evt.preventDefault();
        this.onSave();
      }
    };

    onSave = () => {
      this.setState({
        saving: true
      });

      return this.props
        .dispatch(createItem(this.props.modelZUID, this.props.itemZUID))
        .then(res => {
          if (this._isMounted) {
            this.setState({
              saving: false
            });
          }

          if (res.err || res.error) {
            if (res.missingRequired) {
              this.props.dispatch(
                notify({
                  message: `You are missing data in ${res.missingRequired
                    .map(f => f.label)
                    .join(", ")}`,
                  kind: "error"
                })
              );

              // scroll to required field
              this.setState({
                makeActive: res.missingRequired[0].ZUID,
                saving: false
              });
            }
            if (res.error) {
              this.props.dispatch(
                notify({
                  message: res.error,
                  kind: "warn"
                })
              );
            }
          } else if (res.data && res.data.ZUID) {
            this.props
              .dispatch(fetchItem(this.props.modelZUID, res.data.ZUID))
              .then(() => {
                // Redirect to new item after creating
                this.props.history.push(
                  `/content/${this.props.modelZUID}/${res.data.ZUID}`
                );
              });

            this.props.dispatch(
              notify({
                message: `Created new ${this.props.model.label} item`,
                kind: "save"
              })
            );
          } else {
            this.props.dispatch(
              notify({
                message: "Unknown issue creating new item",
                kind: "warn"
              })
            );
          }
        })
        .catch(err => {
          console.error(err);
          if (this._isMounted) {
            this.setState({
              saving: false
            });
          }
        });
    };

    makeActive = item => this.setState({ makeActive: item || "" });

    render() {
      return (
        <WithLoader condition={!this.state.loading} message="Creating New Item">
          <section>
            <Header
              onSave={this.onSave}
              model={this.props.model}
              saving={this.state.saving}
              isDirty={this.props.item.dirty}
              makeActive={this.makeActive}
            />
            <main className={styles.ItemCreate}>
              <div className={styles.Editor}>
                <Editor
                  active={this.state.makeActive}
                  scrolled={this.makeActive}
                  itemZUID={this.props.itemZUID}
                  item={this.props.item}
                  items={this.props.content}
                  instance={this.props.instance}
                  modelZUID={this.props.modelZUID}
                  model={this.props.model}
                  fields={this.props.fields}
                  onSave={this.onSave}
                  dispatch={this.props.dispatch}
                  loading={this.state.loading}
                  saving={this.state.saving}
                  isDirty={this.props.item.dirty}
                />

                <div className={styles.Meta}>
                  <Divider className={styles.Divider} />
                  <h2 className={styles.Title}>Meta Settings</h2>
                  {this.props.model && this.props.model.type === "dataset" ? (
                    <DataSettings
                      item={this.props.item}
                      dispatch={this.props.dispatch}
                    />
                  ) : (
                    <ItemSettings
                      instance={this.props.instance}
                      modelZUID={this.props.modelZUID}
                      item={this.props.item}
                      content={this.props.content}
                      dispatch={this.props.dispatch}
                    />
                  )}
                </div>
              </div>
            </main>
          </section>
        </WithLoader>
      );
    }
  }
);
