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
  ScopedCssBaseline,
  Tooltip,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  ListItemButton,
  SvgIcon,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme, theme } from "@zesty-io/material";
import { IconButton as IconButtonCustom } from "@zesty-io/material";
import { SvgIconComponent } from "@mui/icons-material";
import { useLocation, useHistory } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
export interface SubMenu {
  name: string;
  icon: SvgIconComponent;
  path: string;
  onClick?: () => void;
  disableActive?: boolean;
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
}
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
      children,
      ...props
    },
    ref
  ) => {
    const location = useLocation();
    const history = useHistory();
    const childrenContainerRef = useRef<HTMLDivElement | null>(null);
    const [keyword, setKeyword] = useState("");

    useImperativeHandle(
      ref,
      () => {
        return {
          scrollDown() {
            const div = childrenContainerRef.current;
            div.scrollTop = div?.scrollHeight;
          },
        };
      },
      []
    );

    useEffect(() => {
      onFilterChange && onFilterChange(keyword);
    }, [keyword]);

    const themeMode = mode === "light" ? theme : darkTheme;

    return (
      <ThemeProvider theme={themeMode}>
        <ScopedCssBaseline
          component={Box}
          sx={{ height: "100%", width: "inherit" }}
        >
          <Stack
            sx={{
              backgroundColor: "background.paper",
              height: "100%",
              userSelect: "none",
            }}
            {...props}
          >
            <Box py={1.5}>
              <Stack gap={1.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  px={1.5}
                >
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight={700}
                    lineHeight="24px"
                    fontSize={18}
                  >
                    {headerTitle}
                  </Typography>
                  {withTitleButton && (
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
                        <AddRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButtonCustom>
                    </Tooltip>
                  )}
                </Stack>
                {withSearch && (
                  <TextField
                    data-cy={searchId}
                    InputProps={{
                      sx: {
                        backgroundColor: "grey.800",
                      },
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ marginRight: 0.5 }}
                        >
                          <ManageSearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder={searchPlaceholder}
                    size="small"
                    sx={{
                      px: 1.5,
                    }}
                    onChange={(evt) => setKeyword(evt.target.value)}
                    onKeyDown={(evt) => {
                      if (evt.key.toLowerCase() === "enter") {
                        onFilterEnter(keyword);
                      }
                    }}
                  />
                )}
                {!keyword && (
                  <List disablePadding>
                    {!!subMenus?.length &&
                      subMenus?.map((menu) => {
                        // Wildcard match for /content/releases since this has a lot of sub routes
                        const isActive =
                          menu.name.toLowerCase() === "dashboard"
                            ? location.pathname === menu.path
                            : location.pathname.includes(menu.path);

                        return (
                          <ListItem
                            key={menu.name}
                            disablePadding
                            selected={menu.disableActive ? false : isActive}
                            sx={{
                              color: "text.secondary",
                              borderLeft:
                                !menu.disableActive && isActive
                                  ? "2px solid"
                                  : "none",
                              borderColor: "primary.main",
                            }}
                          >
                            <ListItemButton
                              sx={{
                                height: 36,
                                pl: isActive ? 1.25 : 1.5,
                                pr: 1.5,
                                py: 0.75,
                              }}
                              onClick={() => {
                                if (menu.onClick) {
                                  menu.onClick();
                                } else {
                                  history.push(menu.path);
                                }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <SvgIcon component={menu.icon} />
                              </ListItemIcon>
                              <ListItemText
                                primary={menu.name}
                                primaryTypographyProps={{
                                  variant: "body3",
                                  fontWeight: 600,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                  </List>
                )}
              </Stack>
            </Box>
            <Box
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
        </ScopedCssBaseline>
      </ThemeProvider>
    );
  }
);
