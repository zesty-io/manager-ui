import React from "react";
import cx from "classnames";
import moment from "moment";

import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";

import { resolvePathPart } from "../../../../../store/files";

import styles from "./GettingStarted.less";
export function GettingStarted(props) {
  const files = props.files
    .sort((fileA, fileB) =>
      moment(fileA.updatedAt).unix() > moment(fileB.updatedAt).unix() ? -1 : 1
    )
    .slice(0, 10);

  return (
    <section className={styles.GettingStarted}>
      <h1 className={cx(styles.display, styles.Title)}>Getting Started</h1>

      <div className={styles.Grid}>
        <div className={styles.Column}>
          <div className={styles.Topic}>
            <h2 className={styles.subheadline}>Learn Parsley</h2>
            <p className={styles.bodyText}>
              Parsley is the programming language of Zesty.io. It can be used to
              create the presentation layer of this instance. Use the{" "}
              <Url href="https://parsley.zesty.io/" target="_blank">
                <abbr title="Read–eval–print loop">REPL</abbr>
              </Url>{" "}
              as an introduction to Parsley or get started with the{" "}
              <Url
                href="https://zesty.org/services/web-engine/introduction-to-parsley"
                target="_blank"
                title="Intro to Parsley"
              >
                written documentation
              </Url>
              .
            </p>
          </div>
          <div className={styles.Topic}>
            <h2 className={styles.subheadline}>
              Overview of CSS &amp; JavaScript Preprocessing
            </h2>
            <p className={styles.bodyText}>
              Learn more about our{" "}
              <Url
                href="https://zesty.org/services/web-engine/css-processing-flow"
                target="_blank"
                title="CSS & JS Processing Flow"
              >
                preprocessing flows
              </Url>
              .
            </p>
          </div>
          <div className={styles.Topic}>
            <h2 className={styles.subheadline}>
              Using the Atom IDE With Zesty.io
            </h2>
            <iframe
              height="480px"
              width="100%"
              src="https://www.youtube-nocookie.com/embed/s98dR1M2u8E?rel=0"
              frameBorder="0"
              allow="encrypted-media;"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className={styles.Column}>
          <div className={styles.Topic}>
            <h2 className={styles.subheadline}>Latest Saved Files</h2>
            <ul>
              {files.map((file) => (
                <li key={file.ZUID}>
                  <AppLink
                    to={`/code/file/${resolvePathPart(file.type)}/${file.ZUID}`}
                  >
                    {file.fileName}
                  </AppLink>{" "}
                  edited {moment(file.updatedAt).fromNow()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
