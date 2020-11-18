import React, { useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCog,
  faEdit,
  faExclamationCircle,
  faFolder,
  faFolderOpen,
  faPlus,
  faUpload,
  faVideo
} from "@fortawesome/free-solid-svg-icons";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Button } from "@zesty-io/core/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./MediaApp.less";

export default connect(state => {
  return {};
})(function MediaApp(props) {
  return (
    <main className={styles.MediaApp}>
      <WithLoader
        condition={true}
        message="Starting Digital Asset Manager"
        width="100vw"
      >
        <nav className={styles.Nav}>
          <div className={styles.TopNav}>
            <form
              className={styles.searchForm}
              action=""
              style={{ margin: "auto", maxWidth: 300 }}
            >
              <input
                type="text"
                placeholder="Search Your Files"
                name="search2"
              />
              <button type="submit">
                <i className="fa fa-search" />
              </button>
            </form>

            <Button kind="secondary">
              <FontAwesomeIcon icon={faPlus} />
              <span>Create Group</span>
            </Button>
          </div>

          <article className="Parent">
            <ul>
              <h1 className={styles.NavTitle}>Company Title</h1>
              <li className={cx(styles.item, styles.depth1)}>
                <a href="#">
                  <FontAwesomeIcon icon={faFolderOpen} />
                  <span>Group 1</span>
                </a>
              </li>
              <li className={cx(styles.item, styles.depth2)}>
                <a href="#">
                  <FontAwesomeIcon icon={faFolder} />
                  <span>Group 2</span>
                </a>
              </li>
              <li className={cx(styles.item, styles.depth3)}>
                <a href="#">
                  <FontAwesomeIcon icon={faFolder} />
                  <span>Group 3</span>
                </a>
              </li>
            </ul>
          </article>
        </nav>

        {/* Main section right */}
        <section className={styles.Workspace}>
          <div className={styles.TopMainHouse}>
            <div className={styles.TopMainLeft}>
              <Button kind="secondary">
                <FontAwesomeIcon icon={faUpload} />
                <span>Group Name</span>
              </Button>
              <Button kind="secondary"> Upload</Button>
            </div>
            <div className={styles.TopMainRight}>
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

          <section className={styles.GridContainer}>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
                <button className={styles.Check}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/284/196" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="https://placekitten.com/200/286" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img
                  src="http://www.fillmurray.com/g/155/300"
                  alt="FillMurray"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent>
                <img src="https://placekitten.com/200/286" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/284/196" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img
                  src="http://www.fillmurray.com/g/155/300"
                  alt="FillMurray"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faVideo} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
          </section>
        </section>
      </WithLoader>
    </main>
  );
});
