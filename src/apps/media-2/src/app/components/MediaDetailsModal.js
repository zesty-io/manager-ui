import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./MediaDetailsModal.less";

export function MediaDetailsModal() {
  return (
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
  );
}
