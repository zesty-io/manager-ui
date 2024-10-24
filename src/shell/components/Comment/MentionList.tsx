import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  Popper,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  PopperPlacementType,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { useGetUsersQuery } from "../../services/accounts";
import { MD5 } from "../../../utility/md5";

type MentionListProps = {
  anchorEl: Element;
  filterKeyword: string;
  onUserSelected: (email: string) => void;
};
export const MentionList = forwardRef(
  ({ anchorEl, filterKeyword, onUserSelected }: MentionListProps, ref) => {
    const { data: users } = useGetUsersQuery();
    const [popperTopOffset, setPopperTopOffset] = useState(0);
    const [popperBottomOffset, setPopperBottomOffset] = useState(0);
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);
    const [placement, setPlacement] =
      useState<PopperPlacementType>("bottom-start");
    const popperRef = useRef<HTMLDivElement>();
    const listRef = useRef<HTMLUListElement>();

    const sortedUsers = useMemo(() => {
      const _filterKeyword = filterKeyword?.toLowerCase();

      return [...users]
        ?.sort((userA, userB) => userA.firstName.localeCompare(userB.firstName))
        .filter(
          (user) =>
            user.email?.toLowerCase()?.includes(_filterKeyword) ||
            `${user.firstName} ${user.lastName}`
              ?.toLowerCase()
              ?.includes(_filterKeyword)
        );
    }, [users, filterKeyword]);

    useEffect(() => {
      if (
        window.innerHeight - anchorEl?.getBoundingClientRect().top >
        window.innerHeight * 0.2
      ) {
        setPlacement("bottom-start");
      } else {
        setPlacement("top-start");
      }

      setTimeout(() => {
        const { top, bottom } = popperRef.current?.getBoundingClientRect();
        setPopperTopOffset(top);
        setPopperBottomOffset(bottom);
      });
    }, []);

    useEffect(() => {
      listRef.current
        ?.querySelector(".Mui-selected")
        ?.scrollIntoView({ block: "nearest" });
    }, [selectedUserIndex]);

    useEffect(() => {
      // Makes sure that the first user is always selected when filtering
      setSelectedUserIndex(0);
    }, [filterKeyword]);

    useImperativeHandle(
      ref,
      () => {
        return {
          handleChangeSelectedUser(action: "ArrowUp" | "ArrowDown") {
            switch (action) {
              case "ArrowDown":
                const nextIndex = selectedUserIndex + 1;
                setSelectedUserIndex(
                  nextIndex <= users?.length - 1 ? nextIndex : 0
                );
                break;

              case "ArrowUp":
                setSelectedUserIndex(
                  Math.sign(selectedUserIndex - 1) !== -1
                    ? selectedUserIndex - 1
                    : users?.length - 1
                );
                break;

              default:
                break;
            }
          },
          handleSelectUser() {
            onUserSelected(sortedUsers[selectedUserIndex]?.email);
          },
        };
      },
      [selectedUserIndex, sortedUsers]
    );

    const calculateMaxHeight = () => {
      if (placement === "bottom-start") {
        return window.innerHeight - popperTopOffset - 8;
      } else {
        return popperBottomOffset - 8;
      }
    };

    if (!sortedUsers?.length) {
      return <></>;
    }

    return (
      <Popper
        disablePortal
        open
        placement={placement}
        anchorEl={anchorEl}
        ref={popperRef}
        sx={{
          zIndex: theme.zIndex.modal,
        }}
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 1],
              },
            },
            {
              name: "flip",
              enabled: false,
            },
          ],
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
          <List ref={listRef}>
            {sortedUsers?.map((user, index) => (
              <ListItemButton
                divider
                dense
                key={user.ZUID}
                selected={selectedUserIndex === index}
                onClick={() => onUserSelected(user.email)}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
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
  }
);
