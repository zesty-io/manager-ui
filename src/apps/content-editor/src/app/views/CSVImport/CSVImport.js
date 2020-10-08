import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import parse from "csv-parse/lib/es5/sync";
import chunk from "lodash/chunk";
import { FixedSizeList } from "react-window";
import cx from "classnames";

import { Button } from "@zesty-io/core/Button";
import { Columns } from "./Columns";
import { CsvSettings } from "./CsvSettings";
import { Input } from "@zesty-io/core";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import { fetchFields } from "shell/store/fields";

import styles from "./CSVImport.less";
class CSVImport extends Component {
  state = {
    modelZUID: this.props.modelZUID,
    fields: this.props.fields,
    warn: "",
    complete: false,
    inFlight: false,
    success: [],
    failure: [],
    records: [],
    successes: 0,
    height: document.documentElement.clientHeight - 522,
    webMaps: {
      metaDescription: "",
      metaKeywords: null,
      metaLinkText: "",
      metaTitle: "",
      parentZUID: "0", // this should validate that the mapped col contains ZUIDs
      pathPart: "",
      sitemapPriority: -1,
      canonicalTagMode: 0
    }
  };

  chunkSize = 30;

  componentDidMount() {
    // if there are no fields, we need to fetch them here
    if (!this.props.fields || !this.props.fields.length) {
      this.props.dispatch(fetchFields(this.props.modelZUID));
    }
  }

  componentDidUpdate() {
    // update fields if we dont have any, or if the content model has changed
    if (
      this.state.modelZUID !== this.props.modelZUID ||
      (!this.state.fields.length && this.props.fields.length)
    ) {
      this.setState({ fields: this.props.fields });
    }
  }

  handleFile = evt => {
    evt.preventDefault();
    const csvToParse = evt.target.files[0];
    // make sure we have a csv and throw an error if we dont
    if (csvToParse.name.slice(-3).toLowerCase() !== "csv") {
      return this.setState({
        warn: "You selected a file that is not a CSV"
      });
    }
    this.setState({ warn: "" });
    // takes the file object and reads it
    // as a text string into local state
    const reader = new FileReader();
    reader.onload = evt => {
      this.setState({ csv: evt.target.result }, () => {
        // after the text string is set to state
        // we can run our parse to get the records
        this.parseCSV(this.state.csv);
      });
    };
    reader.readAsText(csvToParse);
  };

  parseCSV = csv => {
    const records = parse(csv, {
      skip_empty_lines: true
    });

    // build an array of object to reference data across columns
    const columnsWithValues = records.slice(1).reduce((acc, item, i) => {
      const rec = item.reduce((ac, it, i) => {
        ac[records[0][i]] = it;
        return ac;
      }, {});
      acc.push(rec);
      return acc;
    }, []);

    this.setState({
      cols: records[0],
      records: columnsWithValues
    });
  };

  handleFieldToCSVMap = (fieldName, csvCol) => {
    if (fieldName === "none") {
      // filter out the field association if it exists in the fieldMap
      if (this.state.fieldMaps[csvCol]) {
        let removedFieldMap = { ...this.state.fieldsMaps };
        delete removedFieldMap[csvCol];
        return this.setState({ fieldMaps: removedFieldMap }, () => {
          this.mapFieldsToCols();
        });
      } else {
        // selecting none should not map anything
        return null;
      }
    } else {
      // map the association
      this.setState(
        {
          fieldMaps: { ...this.state.fieldMaps, [csvCol]: fieldName }
        },
        () => {
          this.mapFieldsToCols();
        }
      );
    }
  };

  mapFieldsToCols = () => {
    // Using a set to remove duplication
    let warnFields = new Set();

    // for each record create an item with the corresponding
    // data matched to the field name from the model
    const mappedItems = this.state.records.map(rec => {
      let data = Object.keys(rec).reduce((acc, key, i) => {
        if (this.state.fieldMaps[key]) {
          if (acc[this.state.fieldMaps[key]]) {
            warnFields.add(this.state.fieldMaps[key]);
          }
          acc[this.state.fieldMaps[key]] = rec[key];
        }
        return acc;
      }, {});
      return { data };
    });

    // warn the user of duplicate column use
    let warn = "";
    if (warnFields.size) {
      warn = `You have duplicated the use of these columns: ${Array.from(
        warnFields
      ).join(" & ")}`;
    }
    this.setState({ mappedItems, warn });
  };

  handleWebToCSVMap = (csvCol, webKey) => {
    this.setState({
      webMaps: {
        ...this.state.webMaps,
        [webKey]: csvCol === "none" ? "" : csvCol
      }
    });
  };

  addFailure = index => {
    // add the failed index to the array of failed items
    this.setState({ failure: [...this.state.failure, index] });
  };

  handleCreateItems = () => {
    this.setState({ failure: [] });
    if (!this.props.model.type === "dataset" && !this.state.webMaps.pathPart) {
      return this.props.dispatch(
        notify({
          message: "You must select a column for Path Part",
          kind: "warn"
        })
      );
    }
    if (this.state.warn) {
      return this.props.dispatch(
        notify({
          message: "You must resolve duplicate column conflicts",
          kind: "warn"
        })
      );
    }

    const mappedMetaItems = this.state.mappedItems.map((item, i) => {
      let pathPart = null;
      if (this.state.webMaps.pathPart) {
        pathPart = this.state.records[i][this.state.webMaps.pathPart]
          .trim()
          .toLowerCase()
          .replace(/\&/g, "and")
          .replace(/[^a-zA-Z0-9]/g, "-");
      }

      return {
        ...item,
        web: {
          canonicalQueryParamWhitelist:
            this.state.webMaps.canonicalQueryParamWhitelist || null,
          canonicalTagCustomValue:
            this.state.webMaps.canonicalTagCustomValue || null,
          canonicalTagMode: this.state.webMaps.canonicalTagMode,
          metaDescription: this.state.records[i][
            this.state.webMaps.metaDescription
          ]
            ? this.state.records[i][this.state.webMaps.metaDescription].substr(
                0,
                160
              )
            : "",
          metaKeywords: this.state.records[i][this.state.webMaps.metaKeywords],
          metaLinkText: this.state.records[i][this.state.webMaps.metaLinkText]
            ? this.state.records[i][this.state.webMaps.metaLinkText].substr(
                0,
                150
              )
            : "",
          metaTitle: this.state.records[i][this.state.webMaps.metaTitle]
            ? this.state.records[i][this.state.webMaps.metaTitle].substr(0, 150)
            : "",
          parentZUID: this.state.records[i][this.state.webMaps.parentZUID],
          pathPart,
          sitemapPriority: this.state.webMaps.sitemapPriority
        },
        meta: {
          contentModelZUID: this.props.modelZUID,
          createdByUserZUID: this.props.userZUID
        }
      };
    });

    this.setState({ mappedMetaItems, inFlight: true }, () => {
      // we make the fetch call after state has been set
      this.createAllItems().then(() => {
        this.setState({ inFlight: false, complete: true });
      });
    });
  };

  createBatchItems(batch, index) {
    return Promise.allSettled(
      batch.map((item, i) => {
        return request(
          `${CONFIG.API_INSTANCE}/content/models/${this.props.modelZUID}/items`,
          {
            method: "POST",
            json: true,
            body: item
          }
        )
          .then(res => {
            if (res.status === 400) {
              this.props.dispatch(
                notify({
                  message: `Failure creating item: ${res.error}`,
                  kind: "error"
                })
              );
              this.addFailure(index * this.chunkSize + i);
            } else if (res.error) {
              this.addFailure(index * this.chunkSize + i);
            } else {
              const successes = this.state.successes + 1;
              this.setState({ successes });
              return res;
            }
          })
          .catch(err => {
            this.addFailure(index * this.chunkSize + i);
          });
      })
    );
  }

  createAllItems() {
    const chunkedItems = chunk(this.state.mappedMetaItems, this.chunkSize);

    return chunkedItems.reduce((promise, batch, index) => {
      return promise.then(results => {
        return this.createBatchItems(batch, index).then(data => {
          results.push(data);
          return results;
        });
      });
    }, Promise.resolve([]));
  }

  render() {
    // if import is complete, records shown are errors only
    const records = this.state.complete
      ? this.state.records.filter((record, index) =>
          this.state.failure.includes(index)
        )
      : this.state.records;
    return (
      <main className={styles.CSVImport}>
        <div className={styles.Top}>
          <form className={styles.File}>
            <p> Choose a CSV file to import:</p>
            <input
              type="file"
              id="csv"
              name="csv"
              accept=".csv"
              onChange={this.handleFile}
            />
            <label htmlFor="csv">Choose a CSV File </label>
            <span className={styles.warning}>{this.state.warn}</span>
          </form>
          <span className={styles.save}>
            <Button
              kind="save"
              disabled={
                this.state.complete ||
                this.state.inFlight ||
                !this.state.fieldMaps
              }
              onClick={this.handleCreateItems}
            >
              Create Items
            </Button>
          </span>
        </div>
        <div className={styles.Mid}>
          {/* WebData/MetaData Mapping */}
          {this.state.cols && (
            <CsvSettings
              handleMap={this.handleWebToCSVMap}
              webMaps={this.state.webMaps}
              cols={this.state.cols}
              styles={styles.Settings}
            />
          )}
          <div className={styles.ImportResults}>
            {this.state.mappedMetaItems && (
              <div>
                Imported {this.state.successes} of{" "}
                {this.state.mappedMetaItems.length}
              </div>
            )}
            {this.state.failure.length ? (
              <div>Errors {this.state.failure.length}</div>
            ) : null}
          </div>
        </div>
        {this.state.cols && (
          <Columns
            handleMap={this.handleFieldToCSVMap}
            fields={this.state.fields}
            cols={this.state.cols}
          />
        )}
        {records && (
          <FixedSizeList
            itemCount={records.length}
            itemData={{
              data: records,
              // if import is complete, records shown are errors only
              error: this.state.complete
            }}
            itemSize={61}
            height={this.state.height}
            width="100%"
          >
            {Row}
          </FixedSizeList>
        )}
      </main>
    );
  }
}

class Row extends PureComponent {
  render() {
    const item = this.props.data.data[this.props.index];
    return (
      <span
        style={this.props.style}
        className={cx(styles.wrap, { [styles.failure]: this.props.data.error })}
      >
        {Object.keys(item).map(key => {
          return (
            <div key={key} className={styles.column}>
              <span key={item[key]} className={styles.Cell}>
                {item[key].substr(0, 120)}
              </span>
            </div>
          );
        })}
      </span>
    );
  }
}

export default connect((state, props) => {
  const { modelZUID } = props.match.params;
  const model = state.models[modelZUID];
  const fields = Object.keys(state.fields)
    .filter(fieldZUID => state.fields[fieldZUID].contentModelZUID === modelZUID)
    .map(fieldZUID => state.fields[fieldZUID])
    .sort((a, b) => a.sort - b.sort);
  return {
    modelZUID,
    model,
    fields,
    userZUID: state.user.user_zuid
  };
})(CSVImport);
