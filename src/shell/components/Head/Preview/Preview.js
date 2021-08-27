import styles from "./Preview.less";
export const Preview = (props) => (
  <aside className={styles.TagPreviewWrap}>
    {/* {`<!-- Global head tags are inserted before local tags --> \n`} */}
    <pre className={styles.TagPreview}>
      <div className={styles.Tag}>{`<head>`}</div>
      <div>
        {props.item &&
          props.item.web &&
          `
  <!-- Auto-generated Head Tags -->
  <title>${props.item.web.metaTitle}</title>
  <link rel="canonical" href="${props.domain}${props.item.web.path}" />

  <meta name="description" content="${props.item.web.metaDescription}" />
  <meta name="keywords" content="${props.item.web.metaKeywords}" />
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary">
  <meta property="og:title" content="${props.item.web.metaTitle}" />
  <meta name="twitter:title" content="${props.item.web.metaTitle}">
  <meta property="og:description" content="${props.item.web.metaDescription}" />
  <meta property="twitter:description" content="${props.item.web.metaDescription}" />
  <meta property="og:url" content="${props.domain}${props.item.web.path}" />
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${props.instanceName}" />\n
`}
      </div>
      {`  <!-- Custom Head Tags -->\n`}
      {props.tags &&
        props.tags
          .map(
            (tag) =>
              `  <${tag.type} ${tag.attributes
                .map((attr) => `${attr.key}="${attr.value}"`)
                .join(" ")} />`
          )
          .join("\n")}

      <div className={styles.Tag}>{`</head>`}</div>
    </pre>
  </aside>
);
