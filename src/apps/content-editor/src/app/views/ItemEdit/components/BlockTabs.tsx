import {
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItemButton,
  Button,
} from "@mui/material";
import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { VerticalSplitRounded, InfoRounded } from "@mui/icons-material";
import { Actions } from "../Content/Actions";
import { customTheme } from "../../../ContentEditor";
import { useHistory, useParams } from "react-router";
import { useGetContentModelItemsQuery } from "../../../../../../../shell/services/instance";
import { ContentItem } from "../../../../../../../shell/services/types";
import moment from "moment-timezone";
import { useGetUsersQuery } from "../../../../../../../shell/services/accounts";
import { AddRounded } from "@mui/icons-material";

export const BlockTabs = (props: any) => {
  const [value, setValue] = useState(0);
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data, isFetching } = useGetContentModelItemsQuery({
    modelZUID: modelZUID,
  });
  const history = useHistory();

  return (
    <ThemeProvider theme={theme}>
      <Box
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
        }}
      >
        <Tabs
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          sx={{
            position: "relative",
            top: "2px",
          }}
        >
          <Tab
            label="Variants"
            icon={<VerticalSplitRounded fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Info"
            icon={<InfoRounded fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
        <Button
          size="xsmall"
          sx={{
            color: "text.disabled",
            lineHeight: "20px",
            "& .MuiButton-startIcon": {
              marginRight: "4px",
            },
          }}
          onClick={() => {
            history.push(`/blocks/${modelZUID}/new`);
          }}
          color="inherit"
          startIcon={
            <AddRounded
              color="action"
              sx={{
                width: "20px",
                height: "20px",
              }}
            />
          }
        >
          Create Variant
        </Button>
      </Box>
      {value === 0 && (
        <List
          disablePadding
          sx={{
            mt: 2,
            borderRadius: "8px",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "border",
            backgroundColor: "common.white",
            height: "calc(100% - 64px)",
            overflowY: "auto",
          }}
        >
          {data
            ?.slice()
            ?.sort((a, b) => {
              return a.web?.metaTitle.localeCompare(b.web?.metaTitle);
            })
            ?.map((block) => (
              <BlockVariantCard block={block} />
            ))}
        </List>
      )}
      {value === 1 && (
        <ThemeProvider theme={customTheme}>
          <Box
            // maxWidth={320}
            height="calc(100% - 64px)"
            sx={{
              overflowY: "auto",
            }}
          >
            <Actions
              {...props}
              site={{}}
              set={{
                type: props.model?.type,
              }}
            />
          </Box>
        </ThemeProvider>
      )}
    </ThemeProvider>
  );
};

const BlockVariantCard = ({ block }: { block: ContentItem }) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: users } = useGetUsersQuery();
  const updatedByUser = users?.find(
    (user) => user.ZUID === block.web?.createdByUserZUID
  );
  return (
    <ListItemButton
      divider
      selected={itemZUID === block.meta.ZUID}
      disableGutters
      sx={{
        display: "flex",
        px: 2,
        py: 1.75,
        gap: 1.5,
        "&.Mui-selected": {
          "&:first-of-type": {
            borderBottomColor: "primary.main",
          },
          "&:not(:last-of-type)": {
            borderBottomColor: "primary.main",
          },
        },
      }}
      onClick={() => history.push(`/blocks/${modelZUID}/${block.meta.ZUID}`)}
    >
      <Box
        component="img"
        width={187}
        height={120}
        src="https://via.placeholder.com/187x120"
      ></Box>
      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography noWrap variant="body1" fontWeight={700}>
          {block?.web?.metaTitle}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.5}
          fontWeight={600}
        >
          Updated on {moment(block.web?.updatedAt).format("MMMM D")} by{" "}
          {updatedByUser?.firstName} {updatedByUser?.lastName}
        </Typography>
      </Box>
    </ListItemButton>
  );
};
