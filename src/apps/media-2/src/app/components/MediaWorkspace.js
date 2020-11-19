import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCog,
  faEdit,
  faUpload,
  faVideo
} from "@fortawesome/free-solid-svg-icons";

import styles from "./MediaWorkspace.less";

export function MediaWorkspace() {
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
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
        <Card className={styles.Card}>
          <CardContent className={styles.CardContent}>
            <img src="http://www.fillmurray.com/300/200" alt="FillMurray" />
            <button className={styles.Check}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </CardContent>
        </Card>
      </aside>
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
    </section>
  );
}
