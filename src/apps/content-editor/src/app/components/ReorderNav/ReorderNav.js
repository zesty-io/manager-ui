import { Component } from "react";
import { connect } from "react-redux";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SaveIcon from "@mui/icons-material/Save";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import DragList from "./DragComponents/DragList";

import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import { instanceApi } from "../../../../../../shell/services/instance";

import styles from "./ReorderNav.less";
class ReorderNav extends Component {
  state = {
    current: "root",
    root: [
      ...Object.keys(this.props.nav).map((itemZUID) => {
        return {
          label: this.props.nav[itemZUID].label,
          ZUID: this.props.nav[itemZUID].ZUID,
          children: this.props.nav[itemZUID].children,
        };
      }),
    ].filter((item) => item.ZUID !== "Headless"),
    dirty: false,
    requesting: false,
  };

  requestForReorder = () => {
    this.setState({ requesting: true });
    const sortedNodes = this.state[this.state.current].map((item, index) => {
      return {
        zuid: item.ZUID,
        sort: index,
      };
    });
    request(`${CONFIG.API_INSTANCE}/env/nav`, {
      body: { data: sortedNodes },
      json: true,
    })
      .then(() => {
        this.props.dispatch({
          type: "REORDER_NAV",
        });
        this.props.dispatch(
          notify({
            message: "Changes have been saved",
            kind: "save",
          })
        );
        this.setState({
          dirty: false,
          requesting: false,
        });
      })
      .catch((err) => {
        this.props.dispatch(
          notify({ message: "Error saving changes", kind: "error" })
        );
        this.setState({ requesting: false });
      })
      .finally(() =>
        this.props.dispatch(instanceApi.util.invalidateTags(["ContentNav"]))
      );
  };

  handleNestChange = (name) => {
    // set a key on state to the nesting level indicated
    // set 'current' to that ZUID
    if (this.state.current !== "root") {
      return this.setState({
        [name]: [
          ...this.state[this.state.current].find((item) => item.ZUID === name)
            .children,
        ],
        current: name,
      });
    }
    this.setState({
      [name]: [...this.props.nav.find((item) => item.ZUID === name).children],
      current: name,
    });
  };

  handleMove = (draggedZUID, hoveredZUID) => {
    if (!draggedZUID || !hoveredZUID) {
      return;
    }

    const hoveredIndex = [...this.state[this.state.current]].findIndex(
      (i) => i.ZUID === hoveredZUID
    );
    const draggedIndex = [...this.state[this.state.current]].findIndex(
      (i) => i.ZUID === draggedZUID
    );
    const draggedItemData = [...this.state[this.state.current]].find(
      (i) => i.ZUID === draggedZUID
    );
    const _items = [...this.state[this.state.current]];

    _items.splice(draggedIndex, 1);
    _items.splice(hoveredIndex, 0, draggedItemData);

    this.setState({
      [this.state.current]: _items,
      dirty: true,
    });
  };

  render() {
    return (
      this.props.isOpen && (
        <Dialog
          open
          onClose={this.props.toggleOpen}
          className={styles.ReorderNav}
        >
          <DialogTitle component="div">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography variant="h5">
                Change the order of items in your navigation
              </Typography>
              <IconButton size="small" onClick={this.props.toggleOpen}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent className={styles.ModalContent}>
            <DragList
              handleNestChange={this.handleNestChange}
              handleMove={this.handleMove}
            >
              {this.state[this.state.current]}
            </DragList>
          </DialogContent>
          <DialogActions className={styles.ModalFooter}>
            <Button
              variant="contained"
              onClick={() => this.setState({ current: "root" })}
              disabled={this.state.current === "root"}
              startIcon={<FastRewindIcon />}
            >
              Return to Root
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={this.requestForReorder}
              disabled={!this.state.dirty || this.state.requesting}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )
    );
  }
}

export default connect((state) => {
  return { nav: state.navContent.nav };
})(ReorderNav);
