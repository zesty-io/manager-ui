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
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";

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
        <main className={styles.Workspace}>
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
                <img src="https://placekitten.com/200/286" alt="FillMurray" />
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
                <img
                  src="https://images.pexels.com/photos/5700172/pexels-photo-5700172.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="human"
                />
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
              <CardContent>
                <img
                  src="https://images.pexels.com/photos/5706422/pexels-photo-5706422.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="dog"
                />
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
                <img
                  src="https://images.pexels.com/photos/5625007/pexels-photo-5625007.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="FillMurray"
                />
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
                <img
                  src="https://images.pexels.com/photos/5425708/pexels-photo-5425708.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="FillMurray"
                />
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
                <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
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
          </section>
        </main>

        {/* MODAL LAYOUT place here for now */}
        <Modal
          className={styles.Modal}
          type="global"
          // set to true for testing
          open={true}
        >
          <ModalContent>
            <Card>
              <CardHeader>
                <h3>ZUID: 3-a7ebb47-5yf2t</h3>

                <h3>
                  Uploaded: <span>2020-07-30T22:27:19.000Z</span>
                </h3>
              </CardHeader>
              <CardContent
                className={cx(styles.CardContent, styles.CardContentModal)}
              >
                <div>
                  <FieldTypeText
                    className={styles.ModalLabels}
                    name="title"
                    label={
                      <label>
                        <Infotip title="Edit image title" />
                        &nbsp;Title
                      </label>
                    }
                    placeholder={"Image Title"}
                  />
                  <FieldTypeText
                    className={styles.ModalLabels}
                    name="filename"
                    label={
                      <label>
                        <Infotip title="Edit filename " />
                        &nbsp;Filename
                      </label>
                    }
                    placeholder={"Image Filename"}
                  />
                  <FieldLabel
                    className={styles.ModalLabels}
                    name="copylink"
                    label={
                      <label>
                        <Infotip title="Copy URL" />
                        &nbsp;Copy
                      </label>
                    }
                  />
                  <label className="field">
                    <button
                      className="btn copy"
                      type="button"
                      data-clipboard-target="#copy"
                      title="Click to copy"
                    >
                      <span>COPY&nbsp;</span>
                      <img
                        className={styles.Clippy}
                        src="/ui/images/clippy.svg"
                        width="13"
                        alt="Copy to clipboard"
                      ></img>
                    </button>
                    <input id="copy" type="text" defaultValue="VALUE" />
                  </label>
                </div>
                <img
                  className={styles.ModalImage}
                  src="https://images.pexels.com/photos/5425708/pexels-photo-5425708.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt="FillMurray"
                />
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
