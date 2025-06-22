import {
  forwardRef,
  PropsWithChildren,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import {
  Box,
  Stack,
  Typography,
  PaletteMode,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  ListItemButton,
  SvgIcon,
  Theme,
  Skeleton,
  alpha,
} from "@mui/material";
import { IconButton as IconButtonCustom } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import { useLocation, useHistory } from "react-router-dom";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import { AddRounded } from "@mui/icons-material";
import SearchBox from "../SearchBox";

export interface SubMenu {
  name: string;
  icon: SvgIconComponent;
  path: string;
  onClick?: () => void;
  disableActive?: boolean;
  substringPathMatch?: boolean;
}
interface Props {
  onFilterChange?: (keyword: string) => void;
  onFilterEnter?: (keyword: string) => void;
  onAddClick?: () => void;
  mode?: PaletteMode;
  headerTitle: string;
  subMenus?: SubMenu[];
  withSearch?: boolean;
  withTitleButton?: boolean;
  titleButtonTooltip?: string;
  searchId?: string;
  searchPlaceholder?: string;
  hideSubMenuOnSearch?: boolean;
  filterKeyword?: string;
  titleButtonIcon?: SvgIconComponent;
  TitleButtonComponent?: React.ReactNode;
  isLoading?: boolean;
}

const darkTheme = {
  backgroundColor: "grey.900",
  "& .MuiAccordion-root .MuiTypography-root,\
  & .nav-tree-header .MuiTypography-root,\
  & .nav-tree-header .MuiSvgIcon-root": {
    color: "grey.400",
  },
  "& .app-sidebar-header .MuiTypography-root, \
  & .app-sidebar-header .MuiSvgIcon-root": {
    color: "common.white",
  },
  "& .nav-tree-header .MuiIconButton-root:hover": {
    bgcolor: "grey.800",
  },
  "& .app-sidebar-header-container .MuiListItem-root:hover": {
    bgcolor: (theme: Theme) =>
      alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
  },
};

export const AppSideBar = forwardRef<any, PropsWithChildren<Props>>(
  (
    {
      onAddClick,
      onFilterChange,
      onFilterEnter,
      mode = "light",
      headerTitle,
      subMenus,
      withSearch = true,
      withTitleButton = true,
      titleButtonTooltip,
      searchId = "appSidebarSearch",
      searchPlaceholder,
      hideSubMenuOnSearch = true,
      filterKeyword = "",
      titleButtonIcon = AddRounded,
      TitleButtonComponent,
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    const location = useLocation();
    const history = useHistory();
    const childrenContainerRef = useRef<HTMLDivElement | null>(null);
    const textfieldRef = useRef<HTMLInputElement | null>(null);
    const [userInputKeyword, setUserInputKeyword] = useState("");

    useImperativeHandle(
      ref,
      () => {
        return {
          scrollDown() {
            const div = childrenContainerRef.current;
            div.scrollTop = div?.scrollHeight;
          },
          clearAndFocusTextField() {
            setUserInputKeyword("");
            textfieldRef.current?.focus();
          },
        };
      },
      []
    );

    useEffect(() => {
      onFilterChange && onFilterChange(userInputKeyword);
    }, [userInputKeyword]);

    useEffect(() => {
      setUserInputKeyword(filterKeyword);
    }, [filterKeyword]);

    return (
      <Box height="100%" width="inherit" sx={mode === "dark" ? darkTheme : {}}>
        <Stack
          sx={{
            height: "100%",
            userSelect: "none",
          }}
          {...props}
        >
          <Box py={1.5}>
            <Stack gap={1.5} className="app-sidebar-header-container">
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                px={1.5}
                className="app-sidebar-header"
              >
                <Typography
                  data-cy="appSidebarHeaderTitle"
                  variant="h6"
                  fontWeight={700}
                  lineHeight="24px"
                  fontSize={18}
                >
                  {headerTitle}
                </Typography>
                {!!TitleButtonComponent && TitleButtonComponent}
                {withTitleButton && !TitleButtonComponent && (
                  <Tooltip
                    title={titleButtonTooltip}
                    placement="right-start"
                    enterDelay={1000}
                    enterNextDelay={1000}
                  >
                    <IconButtonCustom
                      data-cy="create_new_content_item"
                      variant="contained"
                      size="xsmall"
                      onClick={onAddClick}
                    >
                      <SvgIcon component={titleButtonIcon} fontSize="small" />
                    </IconButtonCustom>
                  </Tooltip>
                )}
              </Stack>
              {withSearch && (
                <SearchBox
                  data-cy={searchId}
                  value={userInputKeyword}
                  inputRef={textfieldRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ManageSearchRoundedIcon
                          fontSize="small"
                          sx={{ color: "grey.400" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  placeholder={searchPlaceholder}
                  size="small"
                  sx={{
                    px: 1.5,
                    height: 36,
                    color: "white",
                    "& .MuiInputBase-root": {
                      backgroundColor: "grey.800",
                      "& input, & fieldset": {
                        border: "none",
                        color: "white",
                      },
                      "& svg, & input::placeholder": {
                        color: "grey.400",
                      },
                      "& .MuiAutocomplete-endAdornment": {
                        right: "5px",
                        fontSize: "1rem",
                      },
                    },
                  }}
                  onChange={(evt) => setUserInputKeyword(evt.target.value)}
                  onKeyDown={(evt) => {
                    if (evt.key.toLowerCase() === "enter") {
                      onFilterEnter && onFilterEnter(userInputKeyword);
                    }
                  }}
                />
              )}
              {hideSubMenuOnSearch && userInputKeyword ? (
                <></>
              ) : (
                <List disablePadding>
                  {isLoading ? (
                    <ListItem
                      disablePadding
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: 36,
                        ml: 1.5,
                        mr: 2,
                        gap: 1,
                        width: "inherit",
                      }}
                    >
                      <Skeleton
                        variant="circular"
                        width={24}
                        height={24}
                        sx={{ backgroundColor: "grey.700", flexShrink: 0 }}
                      />
                      <Skeleton
                        variant="rounded"
                        width="100%"
                        height={12}
                        sx={{ backgroundColor: "grey.700" }}
                      />
                    </ListItem>
                  ) : (
                    !!subMenus?.length &&
                    subMenus?.map((menu) => {
                      const isActive = menu.substringPathMatch
                        ? location.pathname.includes(menu.path)
                        : location.pathname === menu.path;

                      return (
                        <ListItem
                          key={menu.name}
                          disablePadding
                          sx={{
                            color: "grey.400",
                            borderLeft:
                              !menu.disableActive && isActive
                                ? "2px solid"
                                : "none",
                            borderColor: "primary.main",
                          }}
                        >
                          <ListItemButton
                            selected={menu.disableActive ? false : isActive}
                            sx={{
                              height: 36,
                              pl: isActive ? 1.25 : 1.5,
                              pr: 1.5,
                              py: 0.75,
                              "&.Mui-selected .MuiSvgIcon-root, &.Mui-selected .MuiListItemText-primary":
                                {
                                  color: "primary.main",
                                },
                            }}
                            onClick={() => {
                              if (menu.onClick) {
                                menu.onClick();
                              } else {
                                history.push(menu.path);
                              }
                            }}
                          >
                            <ListItemIcon
                              sx={{ minWidth: 32, color: "grey.400" }}
                            >
                              <SvgIcon component={menu.icon} />
                            </ListItemIcon>
                            <ListItemText
                              primary={menu.name}
                              slotProps={{
                                primary: {
                                  variant: "body3",
                                  sx: {
                                    fontWeight: 600,
                                    color: "grey.300",
                                  },
                                },
                              }}
                              sx={{ fill: "grey.400" }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              )}
            </Stack>
          </Box>
          <Box
            className="nav-tree-container"
            height="100%"
            ref={childrenContainerRef}
            sx={{
              overflowY: "auto",
              scrollBehavior: "smooth",
            }}
          >
            {children}
          </Box>
        </Stack>
      </Box>
    );
  }
);
