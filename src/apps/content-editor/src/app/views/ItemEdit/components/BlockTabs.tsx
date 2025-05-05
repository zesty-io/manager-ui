import {
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItemButton,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import { useRef, useState } from "react";

import { VerticalSplitRounded, InfoRounded } from "@mui/icons-material";
import { Actions } from "../Content/Actions";
import { useHistory, useParams } from "react-router";
import { useGetContentModelItemsQuery } from "../../../../../../../shell/services/instance";
import { ContentItem } from "../../../../../../../shell/services/types";
import moment from "moment-timezone";
import { useGetUsersQuery } from "../../../../../../../shell/services/accounts";
import { AddRounded, SearchRounded } from "@mui/icons-material";
import noSearchResults from "../../../../../../../../public/images/noSearchResults.svg";
import blockPlaceholder from "../../../../../../../../public/images/blockPlaceholder.png";
import { CreateVariantDialog } from "../../../../../../blocks/components/CreateVariantDialog";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";

export const BlockTabs = (props: any) => {
  const [value, setValue] = useState(0);
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data, isFetching } = useGetContentModelItemsQuery({
    modelZUID: modelZUID,
  });
  const history = useHistory();
  const searchRef = useRef(null);
  const [search, setSearch] = useState("");
  const [createVariantDialogOpen, setCreateVariantDialogOpen] = useState(false);

  return (
    <>
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
            setCreateVariantDialogOpen(true);
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
        <>
          <TextField
            placeholder="Search variants"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            sx={{
              my: 2,
              width: "100%",
            }}
            inputRef={searchRef}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded color="action" />
                </InputAdornment>
              ),
            }}
          />
          {!!data?.filter((block) =>
            block.web?.metaTitle.toLowerCase().includes(search.toLowerCase())
          )?.length && (
            <List
              disablePadding
              sx={{
                borderRadius: "8px",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "border",
                backgroundColor: "common.white",
                height: "calc(100% - 120px)",
                overflowY: "auto",
              }}
            >
              {data
                ?.filter((block) =>
                  block.web?.metaTitle
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                ?.slice()
                ?.sort((a, b) => {
                  return a.web?.metaTitle.localeCompare(b.web?.metaTitle);
                })
                ?.map((block) => (
                  <BlockVariantCard block={block} />
                ))}
            </List>
          )}
          {search &&
            !data?.filter((block) =>
              block.web?.metaTitle.toLowerCase().includes(search.toLowerCase())
            )?.length && (
              <Box display="flex" gap={2}>
                <Box
                  component="img"
                  src={noSearchResults}
                  width={120}
                  height={110}
                ></Box>
                <Box>
                  <Typography variant="h4" maxWidth={458}>
                    Your search{" "}
                    <strong
                      style={{
                        wordBreak: "break-all",
                      }}
                    >
                      "{search}"
                    </strong>{" "}
                    could not find any results
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    mb={3}
                    maxWidth={458}
                  >
                    Try adjusting your search. We suggest check all words are
                    spelled correctly or try using different keywords.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SearchRounded />}
                    onClick={() => searchRef?.current?.focus()}
                  >
                    Search Again
                  </Button>
                </Box>
              </Box>
            )}
          {createVariantDialogOpen && (
            <CreateVariantDialog
              onClose={() => setCreateVariantDialogOpen(false)}
              model={props?.model}
            />
          )}
        </>
      )}
      {value === 1 && (
        <Box
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
      )}
    </>
  );
};

const BlockVariantCard = ({ block }: { block: ContentItem }) => {
  const history = useHistory();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const isCapturingScreenshot =
    useSelector(
      (state: AppState) => state.content?.[block.meta.ZUID]?.capturingScreenshot
    ) || false;
  const { data: users } = useGetUsersQuery();
  const updatedByUser = users?.find(
    (user) => user.ZUID === block.web?.createdByUserZUID
  );
  const imageRef = useRef(null);
  const [isErrored, setIsErrored] = useState(false);

  return (
    <ListItemButton
      divider
      selected={
        itemZUID === block.meta.ZUID ||
        Object?.values(block?.siblings || {})?.includes(itemZUID)
      }
      disableGutters
      sx={{
        display: "grid",
        position: "relative",
        overflow: "hidden",
        gridTemplateColumns: "187px 1fr",
        px: 2,
        py: 1.75,
        gap: "0px 12px",
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
      {!!isCapturingScreenshot ? (
        <Skeleton
          variant="rectangular"
          width={187}
          height={120}
          sx={{ flexShrink: 0, borderRadius: "8px" }}
        />
      ) : (
        <Box
          ref={imageRef}
          // This make it so that if the image errored it would retry on next organic render
          key={isErrored ? Date.now() : ""}
          component="img"
          width={187}
          height={120}
          sx={{
            objectFit: "contain",
            borderRadius: "8px",
            backgroundColor: "grey.200",
            flexShrink: 0,
          }}
          src={(block.data?.og_image as string) || blockPlaceholder}
          onError={() => {
            setIsErrored(true);
            imageRef.current.src = blockPlaceholder;
          }}
        ></Box>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <Typography
          noWrap
          variant="body1"
          fontWeight={700}
          sx={{
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
