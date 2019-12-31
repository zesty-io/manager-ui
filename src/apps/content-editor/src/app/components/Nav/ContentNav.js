import React from "react";

import { ReorderNav } from "../ReorderNav";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Select, Option } from "@zesty-io/core/Select";

import { collapseNavItem, hideNavItem } from "../../../store/contentNav";

import styles from "./ContentNav.less";
export class ContentNav extends React.Component {
  state = {
    selected: window.location.hash || "",
    openReorder: false,
    hiddenClosed: true
  };

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.handleHashChange);
  }

  componentDidMount() {
    window.addEventListener("hashchange", this.handleHashChange);
  }

  handleOpen = path => {
    this.props.dispatch(collapseNavItem(path));
  };

  handleHide = path => {
    this.props.dispatch(hideNavItem(path));
  };

  handleCreateSelect = (name, ZUID) => {
    if (ZUID && ZUID != "0") {
      window.location.hash = `#!/content/${ZUID}/new`;
    }
  };

  handleHashChange = () => {
    if (window.location.hash !== this.state.selected) {
      this.setState({
        selected: window.location.hash
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className={styles.Actions}>
          <ButtonGroup className={styles.ButtonGroup}>
            <Button
              title="Open content search"
              onClick={() =>
                riot.mount(document.querySelector("#modalMount"), "z-spotlight")
              }
            >
              <i className="fa fa-search" />
              Search
            </Button>
            <Button
              id="ReorderNavButton"
              onClick={() => this.setState({ openReorder: true })}
            >
              <i
                className="fas fa-arrows-alt"
                aria-hidden="true"
                title="Re-order content navigation"
              />
              Reorder
            </Button>
          </ButtonGroup>

          <Select
            name="createItemFromModel"
            className={`${styles.CreateSelect} ${styles.Select} CreateItemDropdown`}
            onSelect={this.handleCreateSelect}
            value="0"
          >
            <Option value="0" text="— Create New Item —" />
            <Option value="link" text="Internal/External Link" />
            {Object.keys(this.props.models)
              .filter(modelZUID => {
                return (
                  this.props.models[modelZUID].label !==
                  ("Dashboard Widgets" || "Widgets")
                );
              })
              .sort((a, b) => {
                return this.props.models[a].label >= this.props.models[b].label
                  ? 1
                  : -1;
              })
              .map(modelZUID => (
                <Option
                  key={modelZUID}
                  value={modelZUID}
                  text={this.props.models[modelZUID].label}
                />
              ))}
          </Select>
        </div>

        <div className={styles.NavWrap}>
          <h1 className={styles.NavTitle}>Content</h1>
          <Nav
            id="MainNavigation"
            className={styles.Nav}
            tree={this.props.nav.nav}
            selected={this.state.selected}
            handleOpen={this.handleOpen}
            handleHide={this.handleHide}
          />

          <h1 className={styles.NavTitle}>Headless Content Models</h1>
          <Nav
            id="HeadlessNavigation"
            className={styles.Nav}
            tree={this.props.nav.headless}
            selected={this.state.selected}
            handleOpen={this.handleOpen}
            handleHide={this.handleHide}
          />

          <div className={styles.HiddenNav}>
            <h1
              className={styles.NavTitle}
              onClick={() =>
                this.setState({
                  hiddenClosed: !this.state.hiddenClosed
                })
              }
            >
              <span style={{ flex: 1 }}>Hidden Items</span>
              <i
                className={
                  this.state.hiddenClosed
                    ? "fa fa-caret-left"
                    : "fa fa-caret-down"
                }
              />
            </h1>
            <Nav
              id="HiddenNav"
              className={
                (styles.Nav,
                this.state.hiddenClosed ? styles.HiddenNavClosed : "")
              }
              tree={this.props.nav.hidden}
              selected={this.state.selected}
              handleOpen={this.handleOpen}
              handleHide={this.handleHide}
            />
          </div>
        </div>

        {this.state.openReorder && (
          <ReorderNav
            handleClose={() =>
              this.setState({
                openReorder: false
              })
            }
          />
        )}
      </React.Fragment>
    );
  }
}
