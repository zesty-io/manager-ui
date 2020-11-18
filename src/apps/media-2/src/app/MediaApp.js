import React, { useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClipboard,
  faCog,
  faEdit,
  faExclamationCircle,
  faFolder,
  faFolderOpen,
  faPlus,
  faUpload,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
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
          {/* PULLING FROM DESIGN-SYSTEM NODE */}
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

          <section className={styles.WorkspaceGrid}>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
                <button className={styles.Check}>
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </CardContent>
              <CardFooter className={styles.CardFooter}>
                <button className={styles.FooterButton}>
                  <FontAwesomeIcon className={styles.Cog} icon={faCog} />
                  <h1 className={styles.Preview}>
                    Polestar_2_006.jpgPolestar_2_006.jpg
                  </h1>
                </button>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img src="http://www.fillmurray.com/284/196" alt="FillMurray" />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faCog} />
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
                    <FontAwesomeIcon icon={faCog} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img
                  src="https://images.pexels.com/photos/5700172/pexels-photo-5700172.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="human"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faCog} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent>
                <img
                  src="https://images.pexels.com/photos/5706422/pexels-photo-5706422.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="dog"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faCog} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img
                  src="https://images.pexels.com/photos/5625007/pexels-photo-5625007.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="FillMurray"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faCog} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
            <Card className={styles.Card}>
              <CardContent className={styles.CardContent}>
                <img
                  src="https://images.pexels.com/photos/5425708/pexels-photo-5425708.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="FillMurray"
                />
              </CardContent>
              <CardFooter>
                <div className={styles.FooterContent}>
                  <button>
                    <FontAwesomeIcon icon={faCog} />
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
                    <FontAwesomeIcon icon={faCog} />
                    <span>Tutorial</span>
                  </button>
                </div>
              </CardFooter>
            </Card>
          </section>
        </section>

        {/* MODAL LAYOUT place here for now */}
        <Modal
          className={styles.Modal}
          type="global"
          // set to true for testing
          open={false}
        >
          <ModalContent>
            <Card>
              <CardHeader>
                <h3>Title: Image Name </h3>
              </CardHeader>
              <CardContent className={styles.CardContent}>
                <div className="content-house">
                  <p>Uploaded: 11/20/2020 8:30 000Z</p>
                  <p>Title: 11/20/2020 8:30 000Z</p>
                  <p>Filename: 11/20/2020 8:30 000Z</p>
                  <button>
                    {/* <FontAwesomeIcon icon={faClipboard} /> */}
                    <span>Copy</span>
                    <img
                      className={styles.Clippy}
                      src="/ui/images/clippy.svg"
                      width="13"
                      alt="Copy to clipboard"
                    ></img>
                  </button>
                  <span>
                    https://8xbq19z1.media.zestyio.com/coffee-coffee-cup-porcelain-coffee-beans-144253.jpeg
                  </span>
                </div>
                <div className="img-house">
                  <img
                    src="https://images.pexels.com/photos/5425708/pexels-photo-5425708.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                    alt="FillMurray"
                  />
                </div>
              </CardContent>
              <CardFooter className={styles.CardFooter}>
                <Button kind="save">
                  <span>Save (CTR + S)</span>
                </Button>
                <Button kind="warn">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>Delete</span>
                </Button>
              </CardFooter>
            </Card>
          </ModalContent>
        </Modal>
      </WithLoader>
    </main>
  );
});
