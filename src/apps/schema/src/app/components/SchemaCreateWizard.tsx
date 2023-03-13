import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Backdrop,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  ListItemButton,
  ListItemText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import winnerPanel from "../../../../../../public/images/winnerPanel.svg";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import { useCreateContentModelFromTemplateMutation } from "../../../../../shell/services/instance";
import { AppState } from "../../../../../shell/store/types";
import { useSelector, useDispatch } from "react-redux";
import { fetchModels } from "../../../../../shell/store/models";
import { notify } from "../../../../../shell/store/notifications";
import { useHistory } from "react-router";

const templates = [
  {
    title: "Blog",
    description:
      "Perfect for blogging with title, body content, feature image, and category fields.",
    repository: "https://github.com/zesty-io/module-boostrap-5.2-blog",
    // This variable is used to determine which content model should be used to create the content item
    mainName: "module_blog",
    icon: <NewspaperRoundedIcon color="action" />,
  },
  // {
  //   title: "E Commerce",
  //   description: "A schema consisting of models for products, and categories.",
  //   repository: "https://github.com/zesty-io/module-bootstrap-5.2-products",
  //   icon: <ShoppingCartIcon color="action" />,
  //   mainName: "",
  // },
  // {
  //   title: "Documentation",
  //   description:
  //     "Perfect for writing official docs for your product or developers.",
  // },
  {
    title: "Landing Page",
    description:
      "A simple landing page with fields for a hero, feature, and footer section.",
    repository: "https://github.com/zesty-io/module-bootstrap-5.2-landing-page",
    icon: <WebRoundedIcon color="action" />,
    mainName: "module_modern_business",
  },
];

export const SchemaCreateWizard = () => {
  const history = useHistory();
  const instance = useSelector((state: AppState) => state.instance);
  const models = useSelector((state: AppState) => state.models);
  const dispatch = useDispatch();
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(null);
  const [createContentModelFromTemplate, { isLoading, isSuccess }] =
    useCreateContentModelFromTemplateMutation();

  const handleNext = () => {
    createContentModelFromTemplate({
      instance_zuid: instance.ZUID,
      repository: templates[selectedTemplateIndex].repository,
      parent_zuid: "0",
    })
      .unwrap()
      .then((res) => dispatch(fetchModels()))
      .catch((res) => {
        dispatch(notify({ kind: "error", message: res?.data?.message }));
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box width="100%" height="100%"></Box>
      <Backdrop open={isLoading} sx={{ flexDirection: "column" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} variant="h4" color="common.white">
          Creating Model
        </Typography>
      </Backdrop>
      <Dialog
        open={!isLoading && !isSuccess}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            minWidth: "640px",
          },
        }}
      >
        <DialogTitle>
          Select a Schema Collections
          <Typography color="text.secondary">
            Start from one of our many schema collections to better understand
            our product
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexWrap="wrap" gap={2} mt={3}>
            {templates.map((template, index) => (
              <ListItemButton
                key={index}
                selected={selectedTemplateIndex === index}
                onClick={() => setSelectedTemplateIndex(index)}
                sx={{
                  border: (theme) =>
                    `1px solid ${
                      selectedTemplateIndex === index
                        ? theme.palette.primary.main
                        : theme.palette.border
                    }`,
                  borderRadius: "4px",
                  p: 2,
                  maxWidth: "282px",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  svg: {
                    color: selectedTemplateIndex === index && "primary.main",
                  },
                }}
              >
                <Box>{template.icon}</Box>
                <ListItemText
                  primary={template.title}
                  secondary={template.description}
                  primaryTypographyProps={{ fontWeight: 700, variant: "body2" }}
                  secondaryTypographyProps={{ color: "text.secondary" }}
                />
              </ListItemButton>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 2 }}>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={selectedTemplateIndex === null}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!isLoading && isSuccess}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            minWidth: "640px",
          },
        }}
      >
        <Box height="100%" textAlign="center" sx={{ py: 4, px: 8 }}>
          <img width="240px" height="160px" src={winnerPanel} />
          <Typography variant="h1" fontWeight={600} sx={{ mt: 3 }}>
            Your Models for Your {templates[selectedTemplateIndex]?.title} are
            Now Built!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            startIcon={<EditIcon />}
            onClick={() =>
              history.push(
                `/content/${
                  Object.values(models).find(
                    (model: any) =>
                      model.name === templates[selectedTemplateIndex].mainName
                    // @ts-ignore
                  )?.ZUID
                }/new`
              )
            }
          >
            Enter a Content Entry
          </Button>
          {/* <Box width="240px" p={2} sx={{backgroundColor: 'grey.50'}}>
            <Typography variant="h6" fontWeight={600}>
            Your Model has the following fields:
            </Typography>
          </Box> */}
        </Box>
      </Dialog>
    </ThemeProvider>
  );
};
