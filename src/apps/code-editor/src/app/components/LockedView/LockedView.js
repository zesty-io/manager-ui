import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import moment from "moment-timezone";

import { checkLock, lock, unlock } from "shell/store/content";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { LockRounded } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
} from "@mui/material";

/**
 * This component is designed to be a generic view lock
 * which can be used on any view with unique path.
 * TODO: extract this into the design-system
 */
export function LockedView(props) {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentUser = useSelector((state) => state.user);

  const [lockData, setLockData] = useState({});
  const [loading, setLoading] = useState(false);

  // NOTE: we have to track these values to avoid a flash
  // of the new view name when changing views.
  const [zuid, setZuid] = useState(props.ZUID);
  const [name, setName] = useState(props.name);

  const onClose = useCallback(() => {
    history.goBack();
  });

  const assumeLock = useCallback(() => {
    return dispatch(unlock(props.ZUID)).then((_) => {
      return dispatch(lock(props.ZUID));
    });
  }, [props.ZUID]);

  const userUnlock = useCallback(() => {
    setLoading(true);
    // NOTE: when a user explicitly takes over a lock
    // we need to update our lock data to close the modal
    assumeLock()
      .then((data) => {
        setLockData(data);
      })
      .finally(() => setLoading(false));
  });

  useEffect(() => {
    // whenever the zuid changes reset state
    setLockData({});
    setZuid(props.ZUID);
    setName(props.name);

    dispatch(checkLock(props.ZUID)).then((data) => {
      if (!!data) {
        setLockData(data);
        if (!data?.path) {
          assumeLock();
        }
      }
    });

    // when the component unmounts or zuid changes unlock the view
    // if it is locked to the current user
    return () => {
      // first get latest lock state
      dispatch(checkLock(props.ZUID)).then((data) => {
        // NOTE: we do not set this lock data as the ZUID changed
        // meaning the user transitioned away from the prior view
        // meaning the results will be stale and no longer be the correct lock
        // data for the view being rendered. As this function gets run after a render process.
        if (data?.userZUID === currentUser.ZUID) {
          dispatch(unlock(props.ZUID));
        }
      });
    };
  }, [props.ZUID, props.name]);

  const isLocked =
    zuid === props.ZUID &&
    lockData.userZUID &&
    lockData.userZUID !== currentUser.ZUID;

  if (isLocked) {
    return (
      <Dialog open fullWidth maxWidth="xs">
        <DialogTitle>
          <Box
            sx={{
              backgroundColor: "warning.light",
              borderRadius: "100%",
              width: "40px",
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <LockRounded color="warning" />
          </Box>

          <Typography variant="inherit" fontWeight={700}>
            File Locked
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {lockData.firstName} {lockData.lastName} is viewing <em>{name}</em>{" "}
            since{" "}
            {moment.unix(lockData.timestamp).format("MMMM Do, YYYY h:mm a")}.
            Unlock this item to ignore this warning and possibly overwrite{" "}
            {lockData.firstName}'s changes.
          </Typography>
        </DialogTitle>
        <DialogActions>
          <Button variant="text" color="inherit" onClick={onClose}>
            Go Back
          </Button>
          <Button
            data-cy="DeleteContentItemConfirmButton"
            variant="contained"
            color="warning"
            onClick={userUnlock}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <LockOpenIcon />
            }
          >
            Unlock
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return <></>;
}
