import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLongArrowAltUp } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import cx from "classnames";
import styles from "./MediaSelected.less";

export function MediaSelected() {
  return (
    <>
      <footer>
        <div className={styles.LoadSelected}>
          <Button kind="save">
            <span>Load Selected</span>
          </Button>
        </div>
        <aside className={styles.MediaSelected}>
          <Card className={cx(styles.Card, styles.CardTop)}>
            <CardContent className={styles.CardContent}>
              <div className={styles.Checkered}>
                <img
                  src="https://img.favpng.com/24/4/6/golden-ratio-face-mathematics-facial-png-favpng-20zD4c1W5ZUnVb4Ve9XGgkHSG.jpg"
                  alt="Transparent Image"
                />
              </div>
              <button className={styles.Check}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </CardContent>
          </Card>

          <Card className={cx(styles.Card, styles.CardTop)}>
            <CardContent
              className={cx(styles.CardContent, styles.CardContentTop)}
            >
              <div className={styles.Checkered}>
                <img src="http://www.fillmurray.com/300/200" alt="Image" />
              </div>

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
      </footer>
    </>
  );
}
