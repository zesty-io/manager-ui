import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Nav } from "@zesty-io/core/Nav";
import { Button } from "@zesty-io/core/Button";

import styles from "./MediaSidebar.less";

export function MediaSidebar(props) {
  const [selected, setSelected] = useState(location.pathname);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  function handleCreateGroup() {}
  return (
    <nav className={styles.Nav}>
      <div className={styles.TopNav}>
        <form className={styles.SearchForm} action="">
          <input type="text" placeholder="Search Your Files" name="search2" />
          <button type="submit">
            <i className="fa fa-search" />
          </button>
        </form>

        <Button
          kind="secondary"
          className={styles.CreateGroup}
          onClick={handleCreateGroup}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Create Group</span>
        </Button>
        <Modal
          className={styles.Modal}
          type="global"
          // set to true for testing
          open={true}
          onClose={() => props.onClose()}
        >
          <ModalContent>
            <form className={styles.SearchForm} action="">
              <input type="text" placeholder="Create Group" name="search2" />
              <button type="submit">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </form>
          </ModalContent>
        </Modal>
      </div>
      <Nav tree={props.nav} selected={selected} />
    </nav>
  );
}
