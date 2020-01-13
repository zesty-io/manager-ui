import React, { Component } from "react";
import cx from "classnames";

import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";
import { Select, Option } from "@zesty-io/core/Select";

import { LanguageSelector } from "../../ItemEdit/components/Header/LanguageSelector";

import styles from "./SetActions.less";
export class SetActions extends Component {
  render() {
    if (this.props.model && this.props.model.name === "clippings") {
      return (
        <header className={styles.Actions}>
          <h1 className={styles.Clippings}>{this.props.model.label}</h1>
        </header>
      );
    } else {
      return (
        <header className={styles.Actions}>
          <div className={styles.Left}>
            <Search
              className={cx(styles.Action, styles.Filter)}
              name="filter"
              value={this.props.filterTerm}
              placeholder="Filter Items"
              onSubmit={this.props.onFilter}
              onChange={this.props.onFilter}
            />

            {/* <LanguageSelector
              className={styles.I18N}
              itemZUID={this.props.itemZUID}
              onSelect={this.props.runAllFilters}
            /> */}

            <Select
              className={cx(styles.Action, styles.Select)}
              name="status"
              value={this.props.status}
              onSelect={this.props.onStatus}
            >
              <Option text="All Status" value="all" />
              <Option text="Published" value="published" />
              <Option text="Scheduled" value="scheduled" />
              <Option text="Un-Published" value="unpublished" />
            </Select>

            <Button
              kind="secondary"
              id="AddItemButton"
              className={cx(styles.Action, styles.Create)}
              onClick={() =>
                (window.location.hash = `/content/${this.props.modelZUID}/new`)
              }
            >
              <i className="fa fa-plus" aria-hidden="true" />
              {this.props.model
                ? `${this.props.model.label} Item`
                : "New Model Item"}
            </Button>

            {Boolean(this.props.isDirty) && (
              <Button
                kind="save"
                className={cx(styles.Action, styles.Save)}
                disabled={this.props.saving}
                onClick={this.props.onSaveAll}
              >
                {this.props.saving ? (
                  <i
                    className={cx("fas fa-sync", styles.Spinner)}
                    aria-hidden="true"
                  />
                ) : (
                  <i className="fas fa-save" aria-hidden="true" />
                )}
                Save All Changes
              </Button>
            )}
            {this.props.loading && (
              <span className={styles.Loading}>
                <i className={cx("fa fa-spinner", styles.Spinner)} />
                <span>Loading items</span>
              </span>
            )}
            {this.props.isSorted && (
              <span
                className={styles.ResetSort}
                onClick={() => this.props.resetSort()}
              >
                <i className={cx("fa fa-close")} />
                <p>&nbsp;Clear Sort</p>
              </span>
            )}
          </div>
          <div className={styles.Right}>
            <Button
              kind="tertiary"
              id="AddCSVButton"
              className={cx(styles.Action, styles.Create)}
              onClick={() =>
                (window.location.hash = `/content/${this.props.modelZUID}/import`)
              }
            >
              <i className="fa fa-upload" aria-hidden="true" />
              Import CSV
            </Button>

            {this.props.model && this.props.user.is_developer && (
              <Button
                className={cx(styles.Action)}
                onClick={() =>
                  (window.location.hash = `/schema/${this.props.modelZUID}`)
                }
              >
                <i className="icon fas fa-database" aria-hidden="true" />
                Edit Schema
              </Button>
            )}

            <h2 className={styles.ModelItemCount}>
              {/*this.props.instance.basicApi ? (
            <Url
            className={styles.InstantApi}
            target="_blank"
            href={`${
              this.props.instance.live_domain
              ? `${this.props.instance.protocol}://${
                this.props.instance.live_domain
              }`
              : this.props.instance.preview_domain
            }/-/instant/${this.props.modelZUID}.json`}
            >
            <i className="fa fa-bolt" aria-hidden="true" />
            &nbsp;Instant API
            </Url>
          ) : null*/}
              <span>{this.props.itemCount} Total Items</span>
            </h2>
          </div>
        </header>
      );
    }
  }
}
