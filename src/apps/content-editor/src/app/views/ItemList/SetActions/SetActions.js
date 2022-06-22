import { Component } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import SaveIcon from "@mui/icons-material/Save";
import StorageIcon from "@mui/icons-material/Storage";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBolt } from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";
import { AppLink } from "@zesty-io/core/AppLink";

import MuiLink from "@mui/material/Link";

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
            <TextField
              name="filter"
              placeholder="Filter Items"
              type="search"
              variant="outlined"
              size="small"
              value={this.props.filterTerm}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(evt) => {
                const term = evt.target.value;
                this.props.onFilter(term);
              }}
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

            <AppLink to={`/content/${this.props.modelZUID}/new`}>
              <Button
                variant="contained"
                color="secondary"
                title="Create Item"
                data-cy="AddItemButton"
                startIcon={<AddIcon />}
              >
                {this.props.model
                  ? `Create ${this.props.model.label} Item`
                  : "Create Model Item"}{" "}
              </Button>
            </AppLink>

            {Boolean(this.props.isDirty) && (
              <Button
                variant="contained"
                color="success"
                title="Save"
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
              <Button
                variant="contained"
                onClick={() => this.props.resetSort()}
                startIcon={<CloseIcon />}
                sx={{
                  cursor: "pointer",
                }}
              >
                Clear Sort
              </Button>
            )}
          </div>
          <div className={styles.Right}>
            <span>{this.props.itemCount} Total Items</span>

            {this.props.instance.basicApi ? (
              <MuiLink
                underline="none"
                color="secondary"
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
              </MuiLink>
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
