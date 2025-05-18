import { FC, useMemo } from "react";
import { Paper, Box, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import { FileTypes } from "../constants";

export type FileProps = {
  icon?: React.ElementType | null;
  fileName: string;
  lastSaved: string;
  path?: string | null;
  ZUID?: string;
  fileType?: string;
  type?: FileTypes;
};

type FileListProps = {
  files: FileProps[];
  searchKeyword?: string;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  onClearSearch?: () => void;
};

const FileRowItem: FC<FileProps & { isLast: boolean }> = ({
  icon: Icon,
  fileName,
  lastSaved,
  path,
  isLast,
}) => {
  return (
    <Box
      component={path ? Link : "div"}
      to={path || undefined}
      px={2}
      width="100%"
      height={56}
      display="flex"
      alignItems="center"
      sx={{
        borderBottom: isLast ? "none" : "1px solid",
        borderColor: "grey.700",
        textDecoration: "none",
        color: "grey.500",
        "&:hover": {
          backgroundColor: "grey.900",
        },
      }}
    >
      <Grid container>
        <Grid size={8} display="flex" alignItems="center" gap={1.5}>
          {Icon && (
            <Icon
              sx={{
                width: 20,
                height: 20,
                color: "grey.500",
              }}
            />
          )}
          <Typography
            variant="body1"
            color="common.white"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              pr: 2.5,
            }}
          >
            {fileName}
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant="body1" color="common.white">
            {moment(lastSaved).fromNow()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const FileListHeader = () => (
  <Box
    px={2}
    width="100%"
    height={56}
    display="flex"
    alignItems="center"
    sx={{
      borderBottom: "1px solid",
      borderColor: "grey.700",
    }}
  >
    <Grid container>
      <Grid size={8}>
        <Typography variant="h6" fontWeight={700} color="common.white">
          File Name
        </Typography>
      </Grid>
      <Grid size={4}>
        <Typography variant="h6" fontWeight={700} color="common.white">
          Last Saved
        </Typography>
      </Grid>
    </Grid>
  </Box>
);

export const FileList: FC<FileListProps> = ({
  files = [],
  searchKeyword,
  searchInputRef,
  onClearSearch,
}) => {
  const filteredFiles = useMemo(() => {
    if (!searchKeyword) return files;

    const searchTerm = searchKeyword.toLowerCase();
    return files.filter((file) => {
      const searchString = [
        file.fileName,
        file.path,
        file.ZUID,
        file.fileType,
        file.type,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return searchString.includes(searchTerm);
    });
  }, [files, searchKeyword]);

  const handleClearSearch = () => {
    onClearSearch?.();
    searchInputRef?.current?.focus();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "inherit",
        color: "grey.400",
        borderColor: "grey.700",
        borderRadius: 2,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <FileListHeader />

      <Box height="calc(100% - 56px)" overflow="auto">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file, index) => (
            <FileRowItem
              key={file.path || file.ZUID || index}
              {...file}
              isLast={index === filteredFiles.length - 1}
            />
          ))
        ) : (
          <Box
            height="100%"
            width="100%"
            sx={{
              display: "grid",
              placeContent: "center",
            }}
          >
            <NoResults
              type="search"
              onButtonClick={handleClearSearch}
              searchTerm={searchKeyword}
              sx={{
                "& img": { height: 200, width: 220 },
                "& h4.MuiTypography-root": { color: "common.white" },
                "& p.MuiTypography-root": { color: "grey.200" },
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};
