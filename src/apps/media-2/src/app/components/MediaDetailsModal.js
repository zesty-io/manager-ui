import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";

import styles from "./MediaDetailsModal.less";

export function MediaDetailsModal() {
  return (
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
  );
}
