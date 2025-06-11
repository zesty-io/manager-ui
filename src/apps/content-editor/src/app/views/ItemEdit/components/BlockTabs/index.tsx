import {
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useRef, useState } from "react";

import {
  VerticalSplitRounded,
  InfoRounded,
  CodeRounded,
} from "@mui/icons-material";
import { Actions } from "../../Content/Actions";
import { useParams } from "react-router";
import { useGetContentModelItemsQuery } from "../../../../../../../../shell/services/instance";
import { AddRounded, SearchRounded } from "@mui/icons-material";
import noSearchResults from "../../../../../../../../../public/images/noSearchResults.svg";
import { CreateVariantDialog } from "../../../../../../../blocks/components/CreateVariantDialog";
import { BlockVariantCard } from "./BlockVariantCard";

export const BlockTabs = (props: any) => {
  const [value, setValue] = useState(0);
  const { modelZUID } = useParams<{ modelZUID: string }>();
  const { data, isFetching } = useGetContentModelItemsQuery({
    modelZUID: modelZUID,
  });
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
          <Tab
            label="Code"
            icon={<CodeRounded fontSize="small" />}
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
      {value === 2 && <Box>Code example</Box>}
    </>
  );
};
