import React, { useState, useEffect } from "react";

import { Button } from "@zesty-io/core/Button";
import { Search } from "@zesty-io/core/Search";
import { Notice } from "@zesty-io/core/Notice";
import { notify } from "shell/store/notifications";

import { getHeadTags, updateSiteFont, deleteSiteFont } from "store/settings";

import styles from "./Fonts.less";
export default function Installed() {
  const [defaultFonts, setDefaultFonts] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    getHeadTags()
      .then(tags => {
        if (isSubscribed) {
          const arrFonts = tags.map(tag => {
            const url = tag.attributes.href;
            return {
              ZUID: tag.ZUID,
              href: tag.attributes.href,
              font: url
                .split("=")[1]
                .split(":")[0]
                .replace("+", " "),
              variants: url.split("=")[1].split(":")[1]
                ? url
                    .split("=")[1]
                    .split(":")[1]
                    .split(",")
                    .map(variant => ({ label: variant, value: "1" }))
                : []
            };
          });

          setFonts(arrFonts);
          setDefaultFonts(arrFonts);

          tags.forEach(tag => {
            const style = document.createElement("style");
            const att = document.createAttribute("id");
            att.value = "googlefont";
            style.setAttributeNode(att);
            const css = `@import url('${tag.attributes.href}');`;
            style.append(css);

            document.head.appendChild(style);
          });
        }
      })
      .catch(err => {
        console.log(err);
      });

    return () => (isSubscribed = false);
  }, []);

  function parseVariant(variant) {
    if (variant.split("").includes("i")) {
      const arrVariant = variant.split("");
      arrVariant.pop();
      return arrVariant.join("") + " Italic";
    }
    return variant === "400" ? "Regular" : variant;
  }

  function parseFontStyle(variant) {
    if (variant.split("").includes("i")) {
      return "italic";
    }
    return "";
  }

  function parseWeight(variant) {
    if (variant.split("").includes("i")) {
      const arrVariant = variant.split("");
      arrVariant.pop();
      return arrVariant.join("");
    }
    return variant;
  }

  function onSearch(value) {
    setSearch(value);
    setTimeout(() => {
      const fontFounded = fonts.find(
        font => font.font.toLowerCase() === value.toLowerCase()
      );
      if (fontFounded) {
        const element = fonts.filter(
          font => font.font.toLowerCase() === value.toLowerCase()
        );
        setFonts(element);
      } else {
        setFonts([]);
      }

      if (value === "") {
        setFonts(defaultFonts);
      }
    }, 2000);
  }

  function uninstallFont(font) {
    const fontToUpdate = fonts.find(f => f.font === font);
    const updateVariants = fontToUpdate.variants
      .filter(variant => variant.value === "1")
      .map(variant => variant.label)
      .join();

    let request;

    if (updateVariants.length) {
      request = updateSiteFont(
        fontToUpdate.ZUID,
        `${fontToUpdate.href.split(":")[0]}${
          fontToUpdate.href.split(":")[1]
        }:${updateVariants}`
      );
    } else {
      request = deleteSiteFont(fontToUpdate.ZUID);
    }

    request
      .then(res => {
        notify({
          kind: "success",
          message: "Font has been removed"
        });
      })
      .catch(err => {
        notify({
          kind: "warn",
          message: err.message
        });
      });
  }

  function toggleEnableFont(variant, value, font) {
    if (window.confirm("Do you really want to uninstall this font?")) {
      const copyFonts = fonts
        .map(f => {
          if (f.font === font) {
            const pos = f.variants.map(v => v.label).indexOf(variant);
            f.variants[pos].value = value.toString();
            f.variants = f.variants.filter(variant => variant.value === "1");
          }
          return f;
        })
        .filter(
          f => f.variants.filter(variant => variant.value === "1").length
        );
      setFonts(copyFonts);
      uninstallFont(font);
    }
  }

  function renderFontsList() {
    return (
      <div className={styles.ContainerListsFonts}>
        {fonts.map((font, index) => (
          <div key={index} className={styles.ListFontItem}>
            <header className={styles.FontHeader}>
              <div>
                <h3>{font.font}</h3>
              </div>
            </header>
            {font.variants.map((variant, idx) => (
              <div
                key={idx}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p
                  key={idx}
                  className={styles.ParagraphFontInstalled}
                  style={{
                    fontFamily: font.font.replace("+", " "),
                    fontWeight: parseWeight(variant.label),
                    fontStyle: parseFontStyle(variant.label)
                  }}
                >
                  All their equipment and instruments are alive.
                </p>
                <Button
                  kind="warn"
                  onClick={() =>
                    toggleEnableFont(variant.label, "0", font.font)
                  }
                  className={styles.ButtonRemoveFont}
                >
                  <i className="fas fa-trash"></i>
                  Remove {parseVariant(variant.label)}
                </Button>
              </div>
            ))}
          </div>
        ))}
        {fonts.length === 0 && (
          <Notice>
            <p>That font doesn't exist</p>
          </Notice>
        )}
      </div>
    );
  }

  return (
    <div className={styles.PageContainer}>
      <header
        className={styles.SearchContainer}
        style={{ justifyContent: "space-between" }}
      >
        <Search
          className={styles.search}
          placeholder="Search font"
          onKeyUp={e => onSearch(e.target.value)}
        />
      </header>
      {renderFontsList()}
    </div>
  );
}
