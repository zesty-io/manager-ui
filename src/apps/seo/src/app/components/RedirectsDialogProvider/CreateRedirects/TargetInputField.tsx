import { useMemo, FC, useState, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import Typography from "@mui/material/Typography";
import { InputAdornment } from "@mui/material";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import { ContentItemProps, ListOptionSkeleton } from "../constants";
import { useLazySearchContentQuery } from "../../../../../../../shell/services/instance";
import { PublishingsMap } from "./CreateForm";
import { useDebounce } from "react-use";
import {
  ContentItem,
  Language,
} from "../../../../../../../shell/services/types";

type TargetInputFieldProps = {
  publishings: PublishingsMap;
  languages: Language[];
  isLoading: boolean;
  value: ContentItemProps;
  onChange: (value: ContentItemProps) => void;
};

const ListOption: FC<ContentItemProps> = ({
  label,
  path,
  id,
  langCode,
  isPublished,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="95%"
      columnGap="12px"
      px="16px"
      py="8px"
    >
      <FormatListBulletedIcon fontSize="small" color="action" />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="stretch"
        width="98%"
        flexGrow={1}
      >
        <Typography
          variant="body2"
          color="text.primary"
          noWrap
          textOverflow="ellipsis"
          title={label?.trim()}
        >
          {`(${langCode}) ${label?.trim()}`}
        </Typography>
        <Typography
          variant="body2"
          color="info.main"
          noWrap
          textOverflow="ellipsis"
        >
          {path}
        </Typography>
      </Box>
    </Box>
  );
};

const TargetInputField: FC<TargetInputFieldProps> = ({
  publishings,
  languages,
  isLoading,
  value,
  onChange,
}) => {
  const textInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const [
    SearchContent,
    { data: contents, isFetching, isLoading: isLoadingContentItems },
  ] = useLazySearchContentQuery();

  useDebounce(
    () => {
      if (!searchTerm.trim()) return;
      SearchContent({
        query: searchTerm,
        order: "modified",
        dir: "asc",
        limit: 10000,
      });
    },
    400,
    [searchTerm]
  );

  const options = useMemo(() => {
    const filteredContents: ContentItem[] = contents?.filter(
      (result) => result?.web?.path !== null
    );
    return filteredContents
      ?.map((item) => {
        const publishInfo = publishings?.[item?.meta?.ZUID];
        const langCode = languages?.find(
          (lang) => lang?.ID === item?.meta?.langID
        )?.code;

        return {
          id: item?.meta?.ZUID,
          label:
            item?.web?.metaTitle || item?.web?.metaLinkText || item?.web?.path,
          path: item?.web?.path,
          publishAt: item?.publishAt || publishInfo?.publishAt || null,
          langCode: langCode || "en",
          isPublished:
            !!publishInfo &&
            publishInfo?.versionZUID === item?.web?.versionZUID,
        };
      })
      ?.sort(
        (a, b) =>
          new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
      );
  }, [contents, publishings, languages]);

  return (
    <>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        freeSolo
        limitTags={1}
        options={options || []}
        size="small"
        fullWidth
        onInputChange={(event, newInputValue) => {
          setSearchTerm(newInputValue);
        }}
        value={value}
        onChange={(event: any, newValue: ContentItemProps | null) => {
          onChange(newValue);
        }}
        loading={
          (isLoading || isFetching || isLoadingContentItems) &&
          !!searchTerm?.length
        }
        onClickCapture={(e) => {
          if (!!value) {
            setOpen(true);
          }
        }}
        loadingText={<ListOptionSkeleton count={5} />}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              inputRef={textInputRef}
              slotProps={{
                input: {
                  ...params.InputProps,
                  placeholder: "Search for item",
                  readOnly: !!value,
                  ...(!!value
                    ? {}
                    : {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }),
                },
              }}
            />
          );
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.id} style={{ padding: 0, margin: 0 }}>
            <ListOption
              label={option.label}
              path={option.path}
              id={option.id}
              langCode={option?.langCode}
              itemZUID={option?.itemZUID}
              publishAt={option?.publishAt}
              isPublished={option?.isPublished}
            />
          </li>
        )}
        renderValue={(data: ContentItemProps, getItemProps) => (
          <Paper
            elevation={0}
            sx={{
              pl: "8px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              height: "52px",
              columnGap: "12px",
              overflow: "hidden",
              position: "relative",
              borderColor: "border",
            }}
          >
            <FormatListBulletedIcon fontSize="small" color="action" />
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="flex-start"
              flexGrow={1}
              sx={{
                overflow: "hidden",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <Typography
                variant="body2"
                color="text.primary"
                noWrap
                textOverflow="ellipsis"
                maxWidth="100%"
                overflow="hidden"
                fontWeight={500}
              >
                {`(${data?.langCode}) ${data?.label?.trim()}`}
              </Typography>
              <Typography
                variant="body2"
                color="info.dark"
                noWrap
                textOverflow="ellipsis"
                maxWidth="100%"
                overflow="hidden"
              >
                {data?.path}
              </Typography>
            </Box>
          </Paper>
        )}
        sx={{
          "& .MuiInputBase-root input": {
            width: !!value ? "5px" : "auto",
            minWidth: "0!important",
          },
        }}
      />
      {value && !value?.isPublished && (
        <Typography
          variant="body2"
          color="warning.dark"
          mt="4px"
          maxWidth="100%"
          overflow="hidden"
          noWrap={false}
          sx={{ wordWrap: "normal" }}
        >
          This item isn't published yet. Any incoming paths will lead to your
          404 page until it goes live.
        </Typography>
      )}
    </>
  );
};

export default TargetInputField;
