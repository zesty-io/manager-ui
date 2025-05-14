import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import Typography from "@mui/material/Typography";
import { Box, Paper, createFilterOptions, Skeleton } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import SearchIcon from "@mui/icons-material/Search";
import { ContentItemProps, TARGET_ERRORS } from "../constants";
import { InputAdornment } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

const LISTBOX_PADDING = 8;

const OuterElementContext = React.createContext({});
const ListOption: React.FC<ContentItemProps> = ({
  label,
  path,
  ZUID,
  langCode,
  isPublished,
  type,
  onDelete = () => {},
  ...props
}) => {
  return (
    <Box
      key={ZUID}
      component="li"
      {...props}
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      flexGrow={1}
      columnGap="12px"
      px="16px"
      py="8px"
    >
      {type === "pageset" ? (
        <DescriptionIcon fontSize="small" color="action" />
      ) : (
        <FormatListBulletedIcon fontSize="small" color="action" />
      )}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="stretch"
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
          overflow="hidden"
          fontWeight={500}
          px="2px"
        >
          {`(${langCode}) ${label?.trim()}`}
        </Typography>
        <Typography
          variant="body2"
          color="info.dark"
          noWrap
          textOverflow="ellipsis"
          maxWidth="100%"
          overflow="hidden"
          px="2px"
        >
          {path}
        </Typography>
      </Box>
    </Box>
  );
};
function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };
  const { item, ...optionProps } = dataSet[0];

  return (
    <ListOption
      label={dataSet[1]?.label}
      path={dataSet[1]?.path}
      ZUID={dataSet[1]?.ZUID}
      langCode={dataSet[1]?.langCode}
      isPublished={dataSet[1]?.isPublished}
      type={dataSet[1]?.type}
      style={inlineStyle}
      {...optionProps}
    />
  );
}

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactElement<unknown>[] = [];
  (children as React.ReactElement<unknown>[]).forEach(
    (
      item: React.ReactElement<unknown> & {
        children?: React.ReactElement<unknown>[];
      }
    ) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  );

  const itemCount = itemData.length;
  const itemSize = 56;

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(() => itemSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref} data-cy="RedirectsTargetOptionsContainer">
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={() => itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

type SearchFieldProps = {
  options: ContentItemProps[];
  loading: boolean;
  value: ContentItemProps;
  onChange: (value: ContentItemProps) => void;
};

const SearchField: React.FC<SearchFieldProps> = ({
  options,
  loading,
  value,
  onChange,
}) => {
  const textInputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: any) =>
      `${option?.label}\n${option?.path}\n${option?.ZUID}`,
  });

  return (
    <>
      <Autocomplete
        data-cy="RedirectsSearchFieldInput"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        limitTags={1}
        options={loading ? [] : options}
        size="small"
        fullWidth
        loading={loading}
        loadingText={<ListOptionSkeleton count={4} />}
        value={value}
        filterOptions={filterOptions}
        onClickCapture={(e) => {
          if (!!value) {
            setOpen(true);
          }
        }}
        noOptionsText="No results found"
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              data-cy="RedirectsSearchFieldInputField"
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
        renderValue={(data: ContentItemProps) => (
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
        onChange={(_: any, newValue: ContentItemProps | null) =>
          onChange(newValue)
        }
        renderOption={(props, option, state) =>
          [props, option, state.index] as React.ReactNode
        }
        slotProps={{
          listbox: {
            component: ListboxComponent,
          },
        }}
        sx={{
          "& .MuiInputBase-root input": {
            width: !!value ? "5px" : "auto",
            minWidth: "0!important",
          },
          "& .MuiAutocomplete-popupIndicator": {
            display: "none",
          },
        }}
      />
      {value && !value?.isPublished && (
        <Typography
          variant="body2"
          color="warning.dark"
          mt="4px"
          data-cy="RedirectsSearchFieldError"
        >
          {TARGET_ERRORS.unpublished}
        </Typography>
      )}
    </>
  );
};

export const ListOptionSkeleton = ({ count = 4 }: { count: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          data-cy="RedirectsTargetListLoadingSkeleton"
          key={index}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          columnGap="12px"
          py="8px"
        >
          <Skeleton
            variant="circular"
            sx={{
              width: "24px",
              height: "24px",
              flexShrink: 0,
            }}
          />

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="cennter"
            alignItems="flex-start"
            width="100%"
            flexGrow={1}
            rowGap="10px"
          >
            <Skeleton width="45%" height="12px" variant="rounded" />
            <Skeleton width="90%" height="12px" variant="rounded" />
          </Box>
        </Box>
      ))}
    </>
  );
};

export default SearchField;
