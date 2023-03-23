import { FC } from "react";
import {
  Stack,
  MenuItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  Typography,
  Divider,
  Avatar,
  Box,
  Grid,
  SvgIcon,
  ListItem,
  MenuList,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";

import { MAIN_DOC_ITEMS, SUB_DOC_ITEMS } from "../config";
import { handleOpenUrl } from "../util";

interface DocsMenuProps {
  onCloseMenu: () => void;
}
export const DocsMenu: FC<DocsMenuProps> = ({ onCloseMenu }) => {
  return (
    <>
      <Stack
        direction="row"
        gap={1.5}
        alignItems="center"
        height={64}
        borderBottom="1px solid"
        py={2.25}
        px={2}
        boxSizing="border-box"
        sx={{ borderColor: "divider" }}
      >
        <Avatar sx={{ bgcolor: "grey.100" }}>
          <MenuBookRoundedIcon color="action" />
        </Avatar>
        <Typography variant="h5" fontWeight={600}>
          Docs
        </Typography>
      </Stack>
      <Grid container px={2}>
        {MAIN_DOC_ITEMS.map((docItem, index) => (
          <Grid item xs={4} key={index} height={106}>
            <ListItemButton
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                height: "inherit",
                p: 0,
              }}
              onClick={() => handleOpenUrl(docItem.url, onCloseMenu)}
            >
              <ListItemIcon sx={{ justifyContent: "center" }}>
                {docItem.iconType === "icon" && (
                  <SvgIcon
                    component={docItem.icon as SvgIconComponent}
                    color={docItem.iconColor}
                    sx={{
                      width: 32,
                      height: 32,
                    }}
                  />
                )}

                {docItem.iconType === "image" && (
                  <img
                    src={docItem.icon as string}
                    alt={docItem.text}
                    width={32}
                    height={32}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                sx={{
                  flex: 0,
                }}
                primaryTypographyProps={{
                  variant: "caption",
                  lineHeight: "18px",
                  letterSpacing: 0.15,
                  align: "center",
                }}
              >
                {docItem.text}
              </ListItemText>
            </ListItemButton>
          </Grid>
        ))}
      </Grid>
      <Divider />
      <MenuList>
        <ListItem sx={{ height: 36 }}>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: 600,
            }}
          >
            Learn more about code
          </ListItemText>
        </ListItem>
        {SUB_DOC_ITEMS.map((subDocItem, index) => (
          <MenuItem onClick={() => handleOpenUrl(subDocItem.url, onCloseMenu)}>
            <ListItemIcon>
              <SvgIcon component={subDocItem.icon as SvgIconComponent} />
            </ListItemIcon>
            <ListItemText>{subDocItem.text}</ListItemText>
          </MenuItem>
        ))}
      </MenuList>
      <Divider />
      <ListItem sx={{ height: 36, mt: 1 }}>
        <ListItemText
          primaryTypographyProps={{
            fontWeight: 600,
          }}
        >
          Need Help? Contact Support
        </ListItemText>
      </ListItem>
      <ListItem
        sx={{
          display: "flex",
          gap: 1.5,
          height: 46,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<EmailRoundedIcon color="action" />}
          onClick={() => handleOpenUrl("mailto:support@zesty.io", onCloseMenu)}
        >
          support@zesty.io
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<ChatRoundedIcon color="action" />}
          onClick={() =>
            handleOpenUrl("https://www.zesty.io/chat", onCloseMenu)
          }
        >
          Get Help
        </Button>
      </ListItem>
    </>
  );
};
