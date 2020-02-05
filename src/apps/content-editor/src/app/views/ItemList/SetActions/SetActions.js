import React, { Component } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faPlus,
  faSpinner,
  faTimesCircle,
  faUpload,
  faDatabase
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";
import { Select, Option } from "@zesty-io/core/Select";
import { AppLink } from "@zesty-io/core/AppLink";

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
            >
              <AppLink to={`/content/${this.props.modelZUID}/new`}>
                <FontAwesomeIcon icon={faPlus} />
                {this.props.model
                  ? `${this.props.model.label} Item`
                  : "New Model Item"}
              </AppLink>
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
                  <FontAwesomeIcon icon={faSave} />
                )}
                Save All Changes
              </Button>
            )}
            {this.props.loading && (
              <span className={styles.Loading}>
                <FontAwesomeIcon icon={faSpinner} />
                <span>Loading items</span>
              </span>
            )}
            {this.props.isSorted && (
              <span
                className={styles.ResetSort}
                onClick={() => this.props.resetSort()}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
                <p>&nbsp;Clear Sort</p>
              </span>
            )}
          </div>
          <div className={styles.Right}>
            <span>{this.props.itemCount} Total Items</span>

            {this.props.instance.basicApi ? (
              <Url
                className={styles.InstantApi}
                target="_blank"
                href={`${
                  this.props.instance.live_domain
                    ? `${this.props.instance.protocol}://${this.props.instance.live_domain}`
                    : this.props.instance.preview_domain
                }/-/instant/${this.props.modelZUID}.json`}
              >
                <i className="fa fa-bolt" aria-hidden="true" />
                &nbsp;Instant API
              </Url>
            ) : null}

            {this.props.model && this.props.user.is_developer && (
              <Button
                className={cx(styles.Action)}
                onClick={() =>
                  (window.location.hash = `/schema/${this.props.modelZUID}`)
                }
              >
                <FontAwesomeIcon icon={faDatabase} />
                Edit Schema
              </Button>
            )}
            <Button
              kind="tertiary"
              id="AddCSVButton"
              className={cx(styles.Action, styles.Create)}
              onClick={() =>
                (window.location.hash = `/content/${this.props.modelZUID}/import`)
              }
            >
              <FontAwesomeIcon icon={faUpload} />
              Import CSV
            </Button>
          </div>
        </header>
      );
    }
  }
}
