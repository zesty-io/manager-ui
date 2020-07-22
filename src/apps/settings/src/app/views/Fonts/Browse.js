import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";
import { Notice } from "@zesty-io/core/Notice";
import { notify } from "shell/store/notifications";

import { installSiteFont, getHeadTags } from "store/settings";

import styles from "./Fonts.less";
export default connect(state => {
  return {
    fonts: state.settings.fonts
  };
})(function Browse(props) {
  const [previewText, setPreviewText] = useState("");
  const [fontsArr, setfontsArr] = useState([]);
  const [styleTags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    start: 0,
    end: 10,
    current: 1,
    total: 0,
    data: []
  });
  const [variantsSelected, setVariants] = useState({});
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    if (isSubscribed) {
      setfontsArr(props.fonts);
      setPagination({
        ...pagination,
        data: props.fonts.slice(pagination.start, pagination.end),
        total: Math.ceil(props.fonts.length / 10)
      });
      setStyleTagsByType(props.fonts);
      setTagsFromFontsArr();
    }

    getHeadTags().catch(err => {
      notify({
        kind: "warn",
        message: "Failed to load instance head tags"
      });
    });

    return () => (isSubscribed = false);
  }, [props]);

  function setStyleTagsByType(fonts) {
    if (Array.isArray(fonts)) {
      fonts.slice(0, 10).forEach(font => {
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

  function setTagsFromFontsArr() {
    setTags(
      props.fonts.map(font => {
        return `@import url('https://fonts.googleapis.com/css?family=${font.family.replace(
          /\s/g,
          "+"
        )}');`;
      })
    );
  }

  function parseVariants(variants) {
    return variants.map(variant => {
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
      f => f.family === font.replace("+", " ")
    );
    const newVariants = fontFound.variants.filter(
      variant => variants.indexOf(variant) === -1
    );
    fontFound.variants = newVariants;
    if (newVariants.length) {
      const pos = pagination.data
        .map(element => element.family)
        .indexOf(font.replace("+", ""));
      copyData[pos] = fontFound;
    } else {
      copyData = copyData.filter(
        element => element.family !== font.replace("+", " ")
      );
    }
    setPagination({ ...pagination, data: copyData });
  }

  function onUpdateFont(font) {
    setLoading(true);

    installSiteFont(font, variantsSelected[font])
      .then(res => {
        setLoading(false);

        filterFontsInstalled(
          res.attributes.href.split("=")[1].split(":")[0],
          parseVariants(
            res.attributes.href
              .split("=")[1]
              .split(":")[1]
              .split(",")
          )
        );

        delete variantsSelected[font];
        props.dispatch(
          notify({
            kind: "success",
            message: "Font installed"
          })
        );
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
        props.dispatch(
          notify({
            kind: "success",
            message: err.message
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
    if (e.target.checked) {
      if (Object.keys(variantsSelected).includes(font)) {
        setVariants({
          ...variantsSelected,
          [font]: [...variantsSelected[font], variantValidation(e.target.name)]
        });
      } else {
        setVariants({
          ...variantsSelected,
          [font]: [variantValidation(e.target.name)]
        });
      }
    } else {
      setVariants({
        ...variantsSelected,
        [font]: variantsSelected[font].filter(
          variant => variant !== variantValidation(e.target.name)
        )
      });
    }
    console.log("varians selected", variantsSelected);
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
                    <li key={index}>
                      <input
                        type="checkbox"
                        onChange={e => selectFontVariant(itemFont.family, e)}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner"></i>
                  ) : (
                    <i className="fas fa-plus"></i>
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
            <Button
              kind="save"
              className={styles.SaveBtn}
              onClick={() => onUpdateFont(itemFont.family)}
            >
              <i className="fas fa-arrow-down"></i> Install
            </Button>
          </div>
        ))}
        {pagination.data.length === 0 && (
          <Notice>
            <p>That font doesn't exist</p>
          </Notice>
        )}
      </div>
    );
  }

  function removeTagsInHead() {
    const tags = document.getElementsByTagName("style");
    Array.from(tags).forEach(tag => {
      if (tag.id === "googlefont") {
        document.head.removeChild(tag);
      }
    });
  }

  function setStyleTags(start, end) {
    styleTags.slice(start, end).forEach(tag => {
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
      data: fontsArr.slice(start, end),
      start: start,
      end: end
    });
  }

  function onSearch(value) {
    setSearch(value);
    setTimeout(() => {
      const fontResult = fontsArr.find(
        font => font.family.toLowerCase() === value.toLowerCase()
      );
      if (fontResult) {
        const element = fontsArr.filter(
          font => font.family.toLowerCase() === value.toLowerCase()
        );
        setPagination({ ...pagination, data: element });
        setStyleTagsByType(fontFound);
      } else {
        setPagination({ ...pagination, data: [] });
      }

      if (value === "") {
        setPagination({ ...pagination, data: fontsArr.slice(0, 10) });
        setStyleTagsByType(fontsArr.slice(0, 10));
      }
    }, 2000);
  }

  return (
    <div className={styles.PageContainer}>
      <header className={styles.SearchContainer}>
        <Search
          className={styles.search}
          placeholder="Search font"
          // onSubmit={onSearch}
          onKeyUp={e => onSearch(e.target.value)}
        />
        <FieldTypeText
          placeholder="Type something to preview"
          className={styles.previewField}
          name="previewText"
          value={previewText}
          onChange={value => setPreviewText(value)}
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
