import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
} from "../../../shell/services/instance";
import emptyItemsList from "../../../../public/images/emptyItemsList.png";
import { CreateVariantDialog } from "../components/CreateVariantDialog";
import { fetchModels } from "../../../shell/store/models";
import { useDispatch } from "react-redux";
import { fetchFields } from "../../../shell/store/fields";
import { useParams as useSearchParams } from "../../../shell/hooks/useParams";
import { ContentItem } from "shell/services/types";
import SearchBox from "shell/components/SearchBox";

export const BlockModel = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { modelZUID } = useParams<{
    modelZUID: string;
  }>();
  const [params] = useSearchParams();
  const [showCreateVariantDialog, setShowCreateVariantDialog] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading, error, isUninitialized } =
    useGetContentModelItemsQuery({
      modelZUID,
    });

  const { data: models } = useGetContentModelsQuery();

  // Used to ensure that the models and fields are fetched into legacy redux store in order for create variant to function correctly
  useEffect(() => {
    dispatch(fetchModels());
    dispatch(fetchFields(modelZUID));
  }, []);

  useEffect(() => {
    setShowCreateVariantDialog(!!params?.get("createVariant"));
  }, [params]);

  const model = models?.find((model) => model.ZUID === modelZUID);

  if (isLoading || isUninitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        width="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        sx={{ backgroundColor: "grey.50" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={4}
          pt={4}
          pb={1.75}
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.border}`,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h3" fontWeight="700">
            {model?.label}
          </Typography>
          <Box display={"flex"} alignItems="center" gap={2}>
            <SearchBox
              data-cy="search-blocks-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              sx={{
                width: "240px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
              }}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Search Variants"
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => setShowCreateVariantDialog(true)}
              data-cy="create-variant-button"
            >
              Create Variant
            </Button>
          </Box>
        </Box>
        {data?.length ? (
          <Box
            px={4.5}
            py={4}
            display="flex"
            gap={2}
            flexWrap={"wrap"}
            sx={{
              overflowY: "scroll",
            }}
          >
            {data
              ?.filter?.((item) =>
                item.web.metaTitle.toLowerCase().includes(search.toLowerCase())
              )
              ?.map((item) => (
                <BlockVariantCard
                  key={item.meta.ZUID}
                  item={item}
                  onClick={() => {
                    history.push(`/blocks/${modelZUID}/${item.meta.ZUID}`);
                  }}
                />
              ))}
          </Box>
        ) : (
          <Box
            display="flex"
            height="100%"
            alignItems="center"
            justifyContent="center"
            px={4}
            gap={6}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Start Creating Variants Now
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1} mb={2}>
                Add your variants here. Start by creating your first variant.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setShowCreateVariantDialog(true)}
                data-cy="create-variant-button"
              >
                Create Variant
              </Button>
            </Box>
            <Box>
              <img
                height={420}
                width={582}
                src={emptyItemsList}
                alt="Empty Items List"
              />
            </Box>
          </Box>
        )}
      </Box>
      {showCreateVariantDialog && (
        <CreateVariantDialog
          onClose={() => setShowCreateVariantDialog(false)}
          model={model}
        />
      )}
    </>
  );
};

type BlockVariantCardProps = {
  item: ContentItem;
  onClick: () => void;
};

const BlockVariantCard = ({ item, onClick }: BlockVariantCardProps) => {
  const [noImage, setNoImage] = useState(false);
  return (
    <Box
      key={item.meta.ZUID}
      width={265}
      sx={{
        border: (theme) => `1px solid ${theme.palette.border}`,
        boxSizing: "border-box",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <Box px={1} pt={1} pb={1.75}>
        {!noImage && (
          <Box
            component="img"
            src={item.data.og_image as string}
            maxHeight={146}
            width="100%"
            sx={{ objectFit: "contain" }}
            onError={(e: any) => {
              setNoImage(true);
            }}
          />
        )}
        {noImage && (
          <Box height={146} width="100%" sx={{ backgroundColor: "grey.300" }} />
        )}
      </Box>
      <Box
        py={2}
        px={1}
        sx={{
          backgroundColor: "background.paper",
        }}
        height={52}
      >
        <Typography noWrap variant="body2">
          {item.web.metaTitle}
        </Typography>
      </Box>
    </Box>
  );
};
