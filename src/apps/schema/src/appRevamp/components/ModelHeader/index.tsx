import { useState } from "react";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import { useHistory, useLocation, useParams } from "react-router";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import moment from "moment";
import SplitscreenRoundedIcon from "@mui/icons-material/SplitscreenRounded";
import RemoveRedEyeRoundedIcon from "@mui/icons-material/RemoveRedEyeRounded";

import { AddFieldModal } from "../AddFieldModal";

type Params = {
  id: string;
};

const modelTypeName = {
  templateset: "Single Page Item",
  pageset: "Multi Page Item",
  dataset: "Headless Data Item",
};

export const ModelHeader = () => {
  const [isAddFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const params = useParams<Params>();
  const { id } = params;
  const { data: models } = useGetContentModelsQuery();
  const location = useLocation();
  const history = useHistory();

  const model = models?.find((model) => model.ZUID === id);

  return (
    <>
      <Box
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.border}` }}
      >
        <Box sx={{ px: 3, pt: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h4" fontWeight={600}>
              {model?.label}
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<PostAddRoundedIcon />}
                onClick={() => history.push(`/content/${model?.ZUID}/new`)}
              >
                Create {model?.label}
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setAddFieldModalOpen(true)}
              >
                Add Field
              </Button>
            </Box>
          </Box>
          <Box mt={1.5}>
            <Typography variant="caption" color="textSecondary">{`${
              modelTypeName[model?.type as keyof typeof modelTypeName]
            } •  ZUID: ${model?.ZUID} •  Last Updated: ${moment(
              model?.updatedAt
            ).format("Do MMMM YYYY [at] h:mm A")}`}</Typography>
          </Box>
          {/* TODO: Update tab theme to match design */}
          <Tabs
            sx={{ position: "relative", top: "1px" }}
            value={location.pathname.split("/").pop()}
            onChange={(event, value) =>
              history.push(`/schema/${model?.ZUID}/${value}`)
            }
          >
            <Tab
              icon={<SplitscreenRoundedIcon />}
              iconPosition="start"
              label="Fields"
              value="fields"
            />
            <Tab
              icon={<RemoveRedEyeRoundedIcon />}
              iconPosition="start"
              label="Info"
              value="info"
            />
          </Tabs>
        </Box>
      </Box>
      <AddFieldModal
        handleCloseModal={setAddFieldModalOpen}
        open={isAddFieldModalOpen}
      />
    </>
  );
};
