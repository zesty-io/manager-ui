import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faDatabase, faFile } from "@fortawesome/free-solid-svg-icons";

import Card from "@mui/material/Card";

import styles from "./ModelType.less";
export function ModelType(props) {
  return (
    <>
      <h2 className={styles.display}>Select Model Type</h2>
      <p className={styles.title}>
        We are going to start by selecting a type of model you would like to
        build?
      </p>

      <main className={styles.Cards}>
        <Card
          onClick={() => props.setModelType("pageset")}
          sx={{
            width: "280px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.modelType === "pageset" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faFile} />
          <h2 className={styles.headline}>Single page</h2>
          <p className={styles.subheadline}>
            e.g. About Us page, Contact Us page
          </p>
        </Card>
        <Card
          onClick={() => props.setModelType("templateset")}
          sx={{
            width: "280px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.modelType === "templateset" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faCopy} />
          <h2 className={styles.headline}>Multi-page set</h2>
          <p className={styles.subheadline}>
            e.g. Articles, Team member profiles
          </p>
        </Card>
        <Card
          onClick={() => props.setModelType("dataset")}
          sx={{
            width: "280px",
            height: "300px",
            p: 2,
            textAlign: "center",
            boxSizing: "border-box",
            cursor: "pointer",
            border: "2px solid",
            "&:hover": {
              borderColor: "secondary.main",
            },
            ...(props.modelType === "dataset" && {
              borderColor: "secondary.main",
            }),
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={faDatabase} />
          <h2 className={styles.headline}>Headless set</h2>
          <p className={styles.subheadline}>
            e.g. app content, mobile navigation, category tags
          </p>
        </Card>
      </main>
    </>
  );
}
