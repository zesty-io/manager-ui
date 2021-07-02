import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Divider } from "@zesty-io/core/Divider";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Url } from "@zesty-io/core/Url";

import styles from "./LockedItem.less";
export const LockedItem = ({
  timestamp,
  userFirstName,
  userLastName,
  userEmail,
  itemName,
  handleUnlock,
  goBack,
}) => {
  return (
    <div className={styles.Wrapper}>
      <Card className={styles.Card}>
        <CardHeader className={styles.Header}>
          <FontAwesomeIcon className={styles.backgroundIcon} icon={faLock} />
          <h1>Item Locked</h1>
        </CardHeader>
        <CardContent className={styles.Center}>
          <p>
            The item <strong>{itemName}</strong> is being edited by{" "}
            {userFirstName} {userLastName} since{" "}
            {moment.unix(timestamp).format("MMMM Do YYYY, [at] h:mm a")}
          </p>

          <p>
            You can contact {userFirstName} via
            <Url title="Email" href={`mailto:${userEmail}`}>
              {userEmail}
            </Url>
          </p>

          <p>
            To ignore this warning and possibly overwrite {userFirstName}'s
            changes you may unlock this content
          </p>
        </CardContent>
        <CardFooter className={styles.Footer}>
          <span className={styles.alignRight}>
            <ButtonGroup>
              <Button
                className={styles.ButtonBack}
                kind="cancel"
                onClick={goBack}
              >
                Go Back
              </Button>
              <Button kind="save" onClick={handleUnlock}>
                <FontAwesomeIcon icon={faUnlock} /> Unlock
              </Button>
            </ButtonGroup>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};
