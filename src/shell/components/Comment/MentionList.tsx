import { useEffect, useRef, useState } from "react";
import {
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

type MentionListProps = {
  anchorEl: Element;
  onClose: () => void;
  onSelect: () => void;
};
export const MentionList = ({
  anchorEl,
  onClose,
  onSelect,
}: MentionListProps) => {
  const { data: users } = useGetUsersQuery();
  const [popperTopOffset, setPopperTopOffset] = useState(0);
  const [popperBottomOffset, setPopperBottomOffset] = useState(0);
  const popperRef = useRef<HTMLDivElement>();

  useEffect(() => {
    setTimeout(() => {
      const { top, bottom } = popperRef.current?.getBoundingClientRect();
      setPopperTopOffset(top);
      setPopperBottomOffset(bottom);
    });
  }, []);

  const calculateMaxHeight = () => {
    const isPopperInBottom =
      anchorEl.getBoundingClientRect().top < popperTopOffset;

    if (isPopperInBottom) {
      return window.innerHeight - popperTopOffset - 8;
    } else {
      return popperBottomOffset - 8;
    }
  };

  return (
    <Popper
      open
      placement="bottom-start"
      anchorEl={anchorEl}
      ref={popperRef}
      sx={{
        zIndex: theme.zIndex.modal,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          overflow: "auto",
          maxHeight: calculateMaxHeight(),
          width: 328,
        }}
      >
        <List>
          {users?.map((user) => (
            <ListItemButton divider dense>
              <ListItemAvatar>
                <Avatar
                  src={`https://www.gravatar.com/avatar/${MD5(
                    user?.email || ""
                  )}?s=40`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${user.firstName} ${user.lastName}`}
                secondary={user.email}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Popper>
  );
};
