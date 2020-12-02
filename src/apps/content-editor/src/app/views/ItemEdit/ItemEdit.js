import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch, Route, Redirect } from "react-router-dom";

import { notify } from "shell/store/notifications";
import { fetchAuditTrailDrafting } from "shell/store/logs";
import { fetchFields } from "shell/store/fields";
import {
  fetchItem,
  saveItem,
  fetchItemPublishing,
  checkLock,
  lock,
  unlock
} from "shell/store/content";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { PendingEditsModal } from "../../components/PendingEditsModal";
import { LockedItem } from "../../components/LockedItem";

import { Content } from "./Content";
import { Meta } from "./Meta";
// import { Head } from "./Head";
import { ItemHead } from "./ItemHead";

class ItemEdit extends Component {
  _isMounted = false;

  // Track our itemZUID so we can determine
  // if a new item has been loaded and request item data.
  // We also have to track modelZUID to determine
  // when switching between new model creation views.
  state = {
    itemZUID: this.props.itemZUID,
    modelZUID: this.props.modelZUID,
    lock: {},
    checkingLock: false,
    loading: true,
    saving: false
  };

  componentDidMount() {
    this._isMounted = true;

    this.onLoad(this.props.modelZUID, this.props.itemZUID);
    window.addEventListener("keydown", this.handleSave);
  }
  componentWillUnmount() {
    this._isMounted = false;

    // release lock when unmounting
    if (this.state.lock.userZUID === this.props.user.user_zuid) {
      this.props.dispatch(unlock(this.state.itemZUID));
    }
    window.removeEventListener("keydown", this.handleSave);
  }
  componentDidUpdate() {
    if (
      this.props.modelZUID !== this.state.modelZUID ||
      this.props.itemZUID !== this.state.itemZUID
    ) {
      // Release previous item lock before loading next
      if (this.state.lock.userZUID === this.props.user.user_zuid) {
        this.props.dispatch(unlock(this.state.itemZUID));
      }

      this.onLoad(this.props.modelZUID, this.props.itemZUID);
    }
  }

  forceUnlock = () => {
    // Transfer item lock to current session user
    this.props.dispatch(unlock(this.state.itemZUID)).then(() => {
      this.props.dispatch(lock(this.state.itemZUID));
    });
    this.setState({
      lock: {
        userZUID: this.props.user.user_zuid
      }
    });
  };

  handleSave = evt => {
    // NOTE: this is likely OS dependant
    if (
      ((this.props.platform.isMac && evt.metaKey) ||
        (!this.props.platform.isMac && evt.ctrlKey)) &&
      evt.key == "s"
    ) {
      evt.preventDefault();
      if (this.props.item && this.props.item.dirty) {
        this.onSave();
      }
    }
  };

  onLoad = (modelZUID, itemZUID) => {
    this.setState({
      loading: true,
      checkingLock: true,
      itemZUID,
      modelZUID
    });

    this.props
      .dispatch(checkLock(itemZUID))
      .then(res => {
        // If no one has a lock then give lock to current user
        if (!res.userZUID) {
          this.props.dispatch(lock(itemZUID));
          this.setState({
            checkingLock: false,
            lock: {
              userZUID: this.props.user.user_zuid
            }
          });
        } else {
          // Capture lock information locally to make
          // locking/unlocking decisions
          this.setState({
            checkingLock: false,
            lock: res
          });
        }
      })
      .catch(() => {
        // If service is unavailable allow all users ownership
        this.setState({
          checkingLock: false,
          lock: {
            userZUID: this.props.user.user_zuid
          }
        });
      });

    Promise.all([
      this.props.dispatch(fetchFields(modelZUID)),
      this.props.dispatch(fetchItem(modelZUID, itemZUID)),
      this.props.dispatch(fetchItemPublishing(modelZUID, itemZUID))
    ])
      .then(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
      })
      .catch(err => {
        console.error("ItemEdit:load:error", err);
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        throw err;
      });
  };

  onSave = () => {
    this.setState({
      saving: true
    });

    // Continue promise chain
    return this.props
      .dispatch(saveItem(this.props.itemZUID))
      .then(res => {
        if (this._isMounted) {
          this.setState({
            saving: false
          });
        }
        if (res.err === "MISSING_REQUIRED") {
          // scroll to required field
          this.setState({
            makeActive: res.missingRequired[0].ZUID
          });
          return this.props.dispatch(
            notify({
              message: `You are missing data in ${res.missingRequired.map(
                f => f.label + " "
              )}`,
              kind: "error"
            })
          );
        } else if (res.status === 400) {
          this.props.dispatch(
            notify({
              message: `Failed to save new version: ${res.error}`,
              kind: "error"
            })
          );
        } else {
          this.props.dispatch(
            notify({
              message: `Saved a new ${
                this.props.item && this.props.item.web.metaLinkText
                  ? this.props.item.web.metaLinkText
                  : ""
              } version`,
              kind: "save"
            })
          );
        }
        // fetch new draft history
        this.props.dispatch(fetchAuditTrailDrafting(this.props.itemZUID));
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            saving: false
          });
        }
        // we need to set the item to dirty again because the save failed
        this.props.dispatch({
          type: "MARK_ITEM_DIRTY",
          itemZUID: this.props.itemZUID
        });
      });
  };

  onDiscard = () => {
    this.props.dispatch({
      type: "UNMARK_ITEMS_DIRTY",
      items: [this.props.itemZUID]
    });
    // Keep promise chain
    return this.props.dispatch(
      fetchItem(this.props.modelZUID, this.props.itemZUID)
    );
  };

  render() {
    return (
      <WithLoader
        condition={
          !this.state.loading &&
          this.props.item &&
          Object.keys(this.props.item).length
        }
        message={
          this.props.model && this.props.model.label
            ? `Loading ${this.props.model && this.props.model.label} Content`
            : "Loading Content"
        }
      >
        {!this.state.checkingLock &&
          this.state.lock.userZUID !== this.props.user.user_zuid && (
            <LockedItem
              timestamp={this.state.lock.timestamp}
              userFirstName={this.state.lock.firstName}
              userLastName={this.state.lock.lastName}
              userEmail={this.state.lock.email}
              itemName={
                this.props.item &&
                this.props.item.web &&
                this.props.item.web.metaLinkText
              }
              handleUnlock={this.forceUnlock}
              goBack={() => this.props.history.goBack()}
            />
          )}

        <PendingEditsModal
          show={this.props.item && Boolean(this.props.item.dirty)}
          title="Unsaved Changes"
          message="You have unsaved changes that will be lost if you leave this page."
          loading={this.state.saving}
          onSave={this.onSave}
          onDiscard={this.onDiscard}
        />

        <section>
          <Switch>
            <Route
              exact
              path="/content/:modelZUID/:itemZUID/head"
              render={({ match }) => {
                return this.props.userRole.name !== "Contributor" ? (
                  <ItemHead
                    instance={this.props.instance}
                    modelZUID={this.props.modelZUID}
                    model={this.props.model}
                    itemZUID={this.props.itemZUID}
                    item={this.props.item}
                    tags={this.props.tags}
                    dispatch={this.props.dispatch}
                  />
                ) : (
                  <Redirect
                    to={`/content/${match.params.modelZUID}/${match.params.itemZUID}`}
                  />
                );
              }}
            />
            <Route
              exact
              path="/content/:modelZUID/:itemZUID/meta"
              render={props => (
                <Meta
                  instance={this.props.instance}
                  modelZUID={this.props.modelZUID}
                  model={this.props.model}
                  itemZUID={this.props.itemZUID}
                  item={this.props.item}
                  items={this.props.items}
                  fields={this.props.fields}
                  userRole={this.props.userRole}
                  user={this.props.user}
                  onSave={this.onSave}
                  dispatch={this.props.dispatch}
                  saving={this.state.saving}
                />
              )}
            />
            <Route
              exact
              path="/content/:modelZUID/:itemZUID"
              render={props => (
                <Content
                  instance={this.props.instance}
                  modelZUID={this.props.modelZUID}
                  model={this.props.model}
                  itemZUID={this.props.itemZUID}
                  item={this.props.item}
                  items={this.props.items}
                  fields={this.props.fields}
                  userRole={this.props.userRole}
                  user={this.props.user}
                  onSave={this.onSave}
                  dispatch={this.props.dispatch}
                  loading={this.state.loading}
                  saving={this.state.saving}
                />
              )}
            />
          </Switch>
        </section>
      </WithLoader>
    );
  }
}
export default connect((state, props) => {
  const { modelZUID, itemZUID } = props.match.params;

  const item = state.content[itemZUID];
  const model = state.models[modelZUID];
  const fields = Object.keys(state.fields)
    .filter(fieldZUID => state.fields[fieldZUID].contentModelZUID === modelZUID)
    .map(fieldZUID => state.fields[fieldZUID])
    .sort((a, b) => a.sort - b.sort);

  const tags = Object.keys(state.headTags)
    .reduce((acc, id) => {
      if (state.headTags[id].resourceZUID === itemZUID) {
        acc.push(state.headTags[id]);
      }
      return acc;
    }, [])
    .sort((tagA, tagB) => {
      return tagA.sort > tagB.sort ? 1 : -1;
    });

  return {
    platform: state.platform,
    modelZUID,
    model,
    itemZUID,
    item,
    tags,
    fields,
    user: state.user,
    userRole: state.userRole,
    logs: state.logs, // TODO filter logs to those for this item,
    instanceZUID: state.instance.ZUID,
    instance: state.instance,
    items: state.content
  };
})(ItemEdit);
