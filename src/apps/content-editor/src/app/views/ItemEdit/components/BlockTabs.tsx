import {
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItemButton,
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

export const BlockTabs = (props: any) => {
  const [value, setValue] = useState(0);
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data, isFetching } = useGetContentModelItemsQuery({
    modelZUID: modelZUID,
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
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
            height: "calc(100% - 62px)",
            overflowY: "auto",
          }}
        >
          {data?.map((block) => (
            <BlockVariantCard block={block} />
          ))}
        </List>
      )}
      {value === 1 && (
        <ThemeProvider theme={customTheme}>
          <Box
            // maxWidth={320}
            height="calc(100% - 62px)"
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
          borderBottomColor: "primary.main",
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
