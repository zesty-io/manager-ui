import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import debounce from "lodash/debounce";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";
import { Notice } from "@zesty-io/core/Notice";
import { notify } from "shell/store/notifications";

import { fetchFontsInstalled, installSiteFont } from "../../../store/settings";

import styles from "./Fonts.less";
export default connect((state) => {
  return {
    fonts: state.settings.fonts,
  };
})(function Browse(props) {
  const [previewText, setPreviewText] = useState("");
  const [styleTags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    start: 0,
    end: 10,
    current: 1,
    total: 0,
    data: [],
  });
  const [variantsSelected, setVariants] = useState({});
  const [saving, setSaving] = useState(false);

  // when google fonts are ready, create pagination, tags state
  // and inject first page of font tags
  useEffect(() => {
    setPagination({
      ...pagination,
      data: props.fonts.slice(pagination.start, pagination.end),
      total: Math.ceil(props.fonts.length / 10),
    });
    injectFontTags(props.fonts);
    setTags(
      props.fonts.map((font) => {
        return `@import url('https://fonts.googleapis.com/css?family=${font.family.replace(
          /\s/g,
          "+"
        )}');`;
      })
    );
  }, [props.fonts]);

  function injectFontTags(fonts) {
    if (Array.isArray(fonts)) {
      fonts.slice(0, 10).forEach((font) => {
        const style = document.createElement("style");
        const att = document.createAttribute("id");
        att.value = "googlefont";
        style.setAttributeNode(att);
        const css = `@import url('https://fonts.googleapis.com/css?family=${font.family.replace(
          /\s/g,
          "+"
        )}');`;
        style.append(css);
        document.head.appendChild(style);
      });
    } else {
      const style = document.createElement("style");
      const att = document.createAttribute("id");
      att.value = "googlefont";
      style.setAttributeNode(att);
      const css = `@import url('https://fonts.googleapis.com/css?family=${fonts.family.replace(
        /\s/g,
        "+"
      )}');`;
      style.append(css);
      document.head.appendChild(style);
    }
  }

  function parseVariants(variants) {
    return variants.map((variant) => {
      if (variant.split("").includes("i") && variant.split("")[0] !== "4") {
        const arrVariant = variant.split("");
        arrVariant.pop();
        return `${arrVariant.join("")}italic`;
      } else {
        switch (variant) {
          case "400":
            return "regular";
          case "400i":
            return "italic";
          default:
            return variant;
        }
      }
    });
  }

  function filterFontsInstalled(font, variants) {
    let copyData = pagination.data;
    const fontFound = pagination.data.find(
      (f) => f.family === font.replace("+", " ")
    );
    const newVariants = fontFound.variants.filter(
      (variant) => variants.indexOf(variant) === -1
    );
    fontFound.variants = newVariants;
    if (newVariants.length) {
      const pos = pagination.data
        .map((element) => element.family)
        .indexOf(font.replace("+", ""));
      copyData[pos] = fontFound;
    } else {
      copyData = copyData.filter(
        (element) => element.family !== font.replace("+", " ")
      );
    }
    setPagination({ ...pagination, data: copyData });
  }

  function onUpdateFont(font) {
    setSaving(true);

    props
      .dispatch(installSiteFont(font, variantsSelected[font]))
      .then((res) => {
        setSaving(false);

        filterFontsInstalled(
          res.attributes.href.split("=")[1].split(":")[0],
          parseVariants(
            res.attributes.href.split("=")[1].split(":")[1].split(",")
          )
        );

        const newVariants = { ...variantsSelected };
        delete newVariants[font];
        setVariants(newVariants);
        props.dispatch(
          notify({
            kind: "success",
            message: "Font installed",
          })
        );
      })
      .then(() => {
        props.dispatch(fetchFontsInstalled());
      })
      .catch((err) => {
        console.log(err);
        setSaving(false);
        props.dispatch(
          notify({
            kind: "success",
            message: err.message,
          })
        );
      });
  }

  function variantValidation(variant) {
    if (
      !isNaN(parseInt(variant.split("it")[0])) &&
      variant.split("it").length > 1
    ) {
      return `${variant.split("it")[0]}i`;
    } else {
      switch (variant) {
        case "regular":
          return "400";
        case "italic":
          return "400i";
        default:
          return variant;
      }
    }
  }

  function selectFontVariant(font, e) {
    let newVariants;
    if (e.target.checked) {
      if (Object.keys(variantsSelected).includes(font)) {
        newVariants = {
          ...variantsSelected,
          [font]: [...variantsSelected[font], variantValidation(e.target.name)],
        };
      } else {
        newVariants = {
          ...variantsSelected,
          [font]: [variantValidation(e.target.name)],
        };
      }
    } else {
      const fontVariants = variantsSelected[font].filter(
        (variant) => variant !== variantValidation(e.target.name)
      );

      newVariants = {
        ...variantsSelected,
      };
      if (fontVariants.length) {
        newVariants[font] = fontVariants;
      } else {
        delete newVariants[font];
      }
    }
    setVariants(newVariants);
  }

  function renderFontsList() {
    return (
      <div className={styles.ContainerListFonts}>
        {pagination.data.map((itemFont, index) => (
          <div key={index} className={styles.ListFontItem}>
            <header className={styles.FontHeader}>
              <div>
                <h3 className={styles.FontFamily}>{itemFont.family}</h3>
                <ul className={styles.FontVariants}>
                  {itemFont.variants.map((item, index) => (
                    <li key={`${itemFont.family}-${item}`}>
                      <input
                        type="checkbox"
                        onChange={(e) => selectFontVariant(itemFont.family, e)}
                        name={item}
                        id={`${item}-${itemFont.family}-${index}`}
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Button
                  kind="save"
                  id="InstallFont"
                  className={styles.SaveBtn}
                  onClick={() => onUpdateFont(itemFont.family)}
                  disabled={saving || !variantsSelected[itemFont.family]}
                >
                  {saving ? (
                    <FontAwesomeIcon spin icon={faSpinner} />
                  ) : (
                    <FontAwesomeIcon icon={faPlus} />
                  )}{" "}
                  Add
                </Button>
              </div>
            </header>
            <p
              className={styles.Example}
              style={{ fontFamily: itemFont.family }}
            >
              {previewText
                ? previewText
                : "All their equipment and instruments are alive."}
            </p>
          </div>
        ))}
        {pagination.data.length === 0 && (
          <Notice>
            <p>No matching fonts found</p>
          </Notice>
        )}
      </div>
    );
  }

  function removeTagsInHead() {
    const tags = document.getElementsByTagName("style");
    Array.from(tags).forEach((tag) => {
      if (tag.id === "googlefont") {
        document.head.removeChild(tag);
      }
    });
  }

  function setStyleTags(start, end) {
    styleTags.slice(start, end).forEach((tag) => {
      const style = document.createElement("style");
      const att = document.createAttribute("id");
      att.value = "googlefont";
      style.setAttributeNode(att);
      style.append(tag);
      document.head.appendChild(style);
    });
  }

  function validateActionPage(action) {
    return action === "next"
      ? pagination.current < pagination.total
      : pagination.current > 1;
  }

  function changePage(action) {
    removeTagsInHead();
    const start = action === "next" ? pagination.end : pagination.start - 10;
    const end = action === "next" ? pagination.end + 10 : pagination.end - 10;

    setStyleTags(start, end);
    setPagination({
      ...pagination,
      current:
        action === "next" ? pagination.current + 1 : pagination.current - 1,
      data: props.fonts.slice(start, end),
      start: start,
      end: end,
    });
  }

  function onSearch(value) {
    setSearch(value);
    debouncedSearch(value);
  }
  const debouncedSearch = useCallback(
    debounce((term) => {
      const fontResult = props.fonts.find(
        (font) => font.family.toLowerCase() === term.toLowerCase()
      );
      if (fontResult) {
        setPagination({ ...pagination, data: [fontResult] });
        injectFontTags(fontResult);
      } else {
        setPagination({ ...pagination, data: [] });
      }

      if (term === "") {
        setPagination({ ...pagination, data: props.fonts.slice(0, 10) });
        injectFontTags(props.fonts.slice(0, 10));
      }
    }, 500),
    [props.fonts]
  );

  return (
    <div className={styles.PageContainer}>
      <header className={styles.SearchContainer}>
        <Search
          className={styles.search}
          placeholder="Search font"
          // onSubmit={onSearch}
          onKeyUp={(e) => onSearch(e.target.value)}
        />
        <FieldTypeText
          placeholder="Type something to preview"
          className={styles.previewField}
          name="previewText"
          value={previewText}
          onChange={(value) => setPreviewText(value)}
        />
      </header>
      {renderFontsList()}
      <div className={styles.Pagination}>
        <Button
          kind="secondary"
          onClick={() => changePage("prev")}
          disabled={!validateActionPage("prev")}
        >
          Prev
        </Button>
        <div style={{ padding: "15px 0px", margin: "0px 20px" }}>
          {`${pagination.current} / ${pagination.total}`}
        </div>
        <Button
          kind="secondary"
          onClick={() => changePage("next")}
          disabled={!validateActionPage("next")}
        >
          Next
        </Button>
      </div>
    </div>
  );
});
