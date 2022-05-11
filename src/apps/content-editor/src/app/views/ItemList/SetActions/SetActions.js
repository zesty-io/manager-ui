import { Component } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import Button from "@mui/material/Button";

import SaveIcon from "@mui/icons-material/Save";
import StorageIcon from "@mui/icons-material/Storage";
import FileUploadIcon from "@mui/icons-material/FileUpload";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSpinner,
  faTimesCircle,
  faUpload,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

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

            <LanguageSelector
              className={styles.I18N}
              itemZUID={this.props.itemZUID}
            />

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
              variant="contained"
              color="secondary"
              title="Create Item"
              id="AddItemButton"
              className={cx(styles.Action, styles.Create)}
            >
              <AppLink
                className={styles.AppLink}
                to={`/content/${this.props.modelZUID}/new`}
              >
                <FontAwesomeIcon icon={faPlus} />
                {this.props.model
                  ? `Create ${this.props.model.label} Item`
                  : "Create Model Item"}
              </AppLink>
            </Button>

            {Boolean(this.props.isDirty) && (
              <Button
                variant="contained"
                color="success"
                title="Save"
                className={cx(styles.Action, styles.Save)}
                disabled={this.props.saving}
                onClick={this.props.onSaveAll}
                startIcon={
                  this.props.saving ? (
                    <CircularProgress size="20px" />
                  ) : (
                    <SaveIcon />
                  )
                }
              >
                Save All Changes
              </Button>
            )}
            {this.props.loading && (
              <span className={styles.Loading}>
                <FontAwesomeIcon icon={faSpinner} spin />
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
                title="Instant API"
                href={`${
                  this.props.instance.live_domain
                    ? `${this.props.instance.protocol}://${this.props.instance.live_domain}`
                    : this.props.instance.preview_domain
                }/-/instant/${this.props.modelZUID}.json`}
              >
                <FontAwesomeIcon icon={faBolt} />
                &nbsp;Instant API
              </Url>
            ) : null}

            {this.props.model && this.props.user.is_developer && (
              <Button
                variant="contained"
                title="Edit Schema"
                className={cx(styles.Action)}
                onClick={() =>
                  (window.location.hash = `/schema/${this.props.modelZUID}`)
                }
                startIcon={<StorageIcon />}
              >
                Edit Schema
              </Button>
            )}
            <Link to={`/content/${this.props.modelZUID}/import`}>
              <Button
                variant="contained"
                title="Add CSV Button"
                id="AddCSVButton"
                className={cx(styles.Action, styles.Create)}
                startIcon={<FileUploadIcon />}
              >
                Import CSV
              </Button>
            </Link>
          </div>
        </header>
      );
    }
  }
}
