import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCog,
  faEdit,
  faUpload,
  faExclamationCircle,
  faVideo
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Button } from "@zesty-io/core/Button";
import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./MediaWorkspace.less";

export function MediaWorkspace(props) {
  return (
    <section className={styles.Workspace}>
      <div className={styles.WorkspaceHeader}>
        <div className={styles.WorkspaceLeft}>
          <Button kind="secondary">
            <FontAwesomeIcon icon={faUpload} />
            <span>Group Name</span>
          </Button>
          <Button kind="secondary"> Upload</Button>
        </div>
        <div className={styles.WorkspaceRight}>
          <Button kind="cancel">
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </Button>
          <Button kind="warn">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>Delete</span>
          </Button>

          <Button kind="default">
            <FontAwesomeIcon icon={faVideo} />
            <span>Tutorial</span>
          </Button>
        </div>
      </div>
      {/*  SELECTED CHECKBOX TOP */}
      <aside className={styles.MediaSelected}>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent className={styles.CardContent}>
            <img src="https://placekitten.com/200/286" alt="cat" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>

        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={cx(styles.Card, styles.CardTop)}>
          <CardContent
            className={cx(styles.CardContent, styles.CardContentTop)}
          >
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
      </aside>
      {/* IMAGE GALLERY SECTION */}
      <section className={styles.WorkspaceGrid}>
        {props.files.map(file => {
          return (
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src={file.url} alt={file.title} />
                <button className={styles.Check}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </CardContent>
              <CardFooter className={styles.CardFooter}>
                <button className={styles.FooterButton}>
                  <FontAwesomeIcon
                    onClick={() => props.setFileDetails(file)}
                    className={styles.Cog}
                    icon={faCog}
                  />
                  <h1 className={styles.Preview}>{file.filename}</h1>
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </section>
  );
}
