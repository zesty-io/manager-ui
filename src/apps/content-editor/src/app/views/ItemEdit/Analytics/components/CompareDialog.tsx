import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Box,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Skeleton,
  SvgIcon,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  useGetAllPublishingsQuery,
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../../../../../shell/services/instance";
import { NoSearchResults } from "../../../../../../../../shell/components/NoSearchResults";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import moment from "moment-timezone";
import { useSelector } from "react-redux";
import { User } from "../../../../../../../../shell/services/types";
import { useGetUsersQuery } from "../../../../../../../../shell/services/accounts";
import { modelIconMap } from "../../../../../../../schema/src/app/utils";
import { useSearchContentQuery } from "../../../../../../../../shell/services/instance";
import { debounce, uniqBy } from "lodash";
import { useParams } from "../../../../../../../../shell/hooks/useParams";

type Props = {
  onClose: () => void;
};

export const CompareDialog = ({ onClose }: Props) => {
  const [params, setParams] = useParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { data: publishings } = useGetAllPublishingsQuery();
  const { data: searchedContentItems, isFetching } = useSearchContentQuery(
    {
      query: debouncedSearch,
      limit: 10,
    },
    {
      skip: !debouncedSearch,
    }
  );

  const uniqueItemPublishings = uniqBy(publishings, "itemZUID");

  const handleItemClick = (itemZUID: string) => {
    setParams(itemZUID, "compare");
    onClose();
  };

  const searchedContentItemPublishings = useMemo(() => {
    if (!uniqueItemPublishings || !searchedContentItems) return [];

    return uniqueItemPublishings.filter((publishing) =>
      searchedContentItems.find(
        (item) => item.meta.ZUID === publishing.itemZUID
      )
    );
  }, [uniqueItemPublishings, searchedContentItems]);

  useEffect(() => {
    const debouncedInput = debounce((value) => {
      setDebouncedSearch(value);
    }, 500);

    debouncedInput(search);

    return () => debouncedInput.cancel();
  }, [search]);

  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: {
          minWidth: "800px",
          height: "100%",
          maxHeight: "min(100%, 1000px)",
          m: 0,
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Box width="640px">
            <Box
              sx={{
                backgroundColor: "blue.50",
                borderRadius: "100%",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CompareArrowsRoundedIcon color="info" />
            </Box>
            <Typography variant="h5" sx={{ mt: 1.5 }}>
              Compare Page
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Please select a page you&apos;d like to compare your current page
              against
            </Typography>
            <TextField
              value={search}
              // trigger on change only on enter
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mt: 1.5 }}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: 0,
                  },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                ref: inputRef,
              }}
              placeholder="Search"
              fullWidth
            />
          </Box>
          <IconButton size="small" onClick={() => onClose()}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="h6" fontWeight="600" mt={2}>
          {debouncedSearch &&
          !isFetching &&
          searchedContentItemPublishings?.length
            ? `${searchedContentItemPublishings?.length} Search Results`
            : "Recent Publishes"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {debouncedSearch &&
        !isFetching &&
        !searchedContentItemPublishings?.length ? (
          <Box
            sx={{
              height: "99%",
              border: "1px solid",
              borderColor: "border",
              borderRadius: "8px",
            }}
          >
            <NoSearchResults
              query={search}
              ignoreFilters
              hideBackButton
              onSearchAgain={() => {
                setSearch("");
                inputRef?.current?.focus();
              }}
            />
          </Box>
        ) : (
          <>
            <List
              disablePadding
              sx={{
                border: "1px solid",
                borderColor: "border",
                borderRadius: "8px",
              }}
            >
              {debouncedSearch && searchedContentItemPublishings?.length
                ? searchedContentItemPublishings
                    ?.slice(0, 10)
                    ?.map((publishing, index) => (
                      <PublishingItem
                        publishing={publishing}
                        divider={
                          index ===
                          searchedContentItemPublishings?.slice(0, 10)?.length -
                            1
                            ? false
                            : true
                        }
                        onClick={handleItemClick}
                      />
                    ))
                : uniqueItemPublishings
                    ?.slice(0, 10)
                    ?.map((publishing: any, index: number) => (
                      <PublishingItem
                        publishing={publishing}
                        divider={
                          index ===
                          uniqueItemPublishings?.slice(0, 10)?.length - 1
                            ? false
                            : true
                        }
                        onClick={handleItemClick}
                      />
                    ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const PublishingItem = ({ publishing, divider, onClick }: any) => {
  const { data: itemData, isFetching: isFetchingItemData } =
    useGetContentItemQuery(publishing.itemZUID);
  const { data: modelData, isFetching: isFetchingModelData } =
    useGetContentModelQuery(itemData?.meta?.contentModelZUID, {
      skip: !itemData?.meta?.contentModelZUID,
    });
  const { data: users, isFetching: isFetchingUsersData } = useGetUsersQuery();
  const languages = useSelector((state: any) => state.languages);
  const langCode = languages.find(
    (lang: any) => lang.ID === itemData?.meta?.langID
  )?.code;
  const langDisplay = langCode ? `(${langCode}) ` : "";

  const hasSiblings =
    itemData &&
    itemData?.siblings &&
    Object.keys(itemData?.siblings).length > 1;

  const itemTitle = `${hasSiblings ? langDisplay : ""} ${
    itemData?.web?.metaTitle || itemData?.web?.path || itemData?.meta.ZUID
  }`;

  const firstName = users?.find(
    (user: User) => user.ZUID === publishing.publishedByUserZUID
  )?.firstName;
  const lastName = users?.find(
    (user: User) => user.ZUID === publishing.publishedByUserZUID
  )?.lastName;

  const showSkeleton =
    isFetchingItemData || isFetchingModelData || isFetchingUsersData;

  const userInfo =
    firstName || lastName ? `${firstName} ${lastName}` : "Unknown User";

  return (
    <ListItemButton
      key={publishing.ZUID}
      divider={divider}
      disableGutters
      disabled={!showSkeleton && !itemData.web.path}
      onClick={() => {
        if (!showSkeleton) onClick(publishing.itemZUID);
      }}
      sx={{
        px: 2,
        py: 1.5,
        borderColor: "border",
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: "34px",
        }}
      >
        {showSkeleton ? (
          <Skeleton variant="circular" width={16} height={16} />
        ) : (
          <SvgIcon
            component={modelIconMap[modelData?.type]}
            color="action"
            sx={{ width: 16, height: 16 }}
          />
        )}
      </ListItemIcon>
      <ListItemText
        sx={{
          m: 0,
        }}
        primary={
          showSkeleton ? (
            <Skeleton
              variant="rectangular"
              height={20}
              width={555}
              sx={{ mb: 1 }}
            />
          ) : (
            itemTitle
          )
        }
        primaryTypographyProps={{
          variant: "body2",
        }}
        secondary={
          showSkeleton ? (
            <Skeleton variant="rectangular" height={10} width={425} />
          ) : (
            `${modelData?.label} • ${moment(
              publishing?.publishAt
            ).fromNow()} • by ${userInfo}`
          )
        }
        secondaryTypographyProps={{
          fontSize: "12px",
          lineHeight: "18px",
        }}
      />
    </ListItemButton>
  );
};
