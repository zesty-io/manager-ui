import { Component } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { Button, Select, MenuItem, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import SaveIcon from "@mui/icons-material/Save";
import StorageIcon from "@mui/icons-material/Storage";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import AddIcon from "@mui/icons-material/Add";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBolt } from "@fortawesome/free-solid-svg-icons";

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
                sx: {
                  height: "32px",
                },
              }}
              onChange={(evt) => {
                const term = evt.target.value;
                this.props.onFilter(term);
              }}
              sx={{
                height: "32px",
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
              onChange={(evt) =>
                this.props.onStatus(evt.target.value, "status")
              }
              size="small"
              sx={{
                height: "32px",
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="unpublished">Un-Published</MenuItem>
            </Select>

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
                sx={{
                  height: "32px",
                }}
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
                  height: "32px",
                }}
              >
                Clear Sort
              </Button>
            )}
          </div>
          <div className={styles.Right}>
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
                sx={{
                  height: "32px",
                }}
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
                sx={{
                  height: "32px",
                }}
              >
                Edit Schema
              </Button>
            )}
            <Link
              to={`/content/${this.props.modelZUID}/import`}
              style={{ color: "#475467" }}
            >
              <Button
                variant="outlined"
                title="Add CSV Button"
                id="AddCSVButton"
                color="inherit"
                startIcon={<TableChartRoundedIcon sx={{ fill: "#10182866" }} />}
                sx={{
                  height: "32px",
                  mr: 1.5,
                  borderColor: "grey.200",
                }}
              >
                Import CSV
              </Button>
            </Link>
            <AppLink to={`/content/${this.props.modelZUID}/new`}>
              <Button
                variant="contained"
                color="secondary"
                title="Create Item"
                data-cy="AddItemButton"
                startIcon={<AddIcon />}
                sx={{
                  height: "32px",
                }}
              >
                {this.props.model ? `Create Item` : "Create Model Item"}{" "}
              </Button>
            </AppLink>
          </div>
        </header>
      );
    }
  }
}
