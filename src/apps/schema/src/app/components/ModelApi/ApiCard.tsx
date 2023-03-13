import { Box, Button } from "@mui/material";
import { ApiType, apiTypeDocsMap } from ".";
import { ApiInfo } from "./ApiInfo";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import InfoIcon from "@mui/icons-material/Info";
import { useHistory, useLocation } from "react-router";

type Props = {
  type: ApiType;
};

const viewEndpointApiTypes: ApiType[] = [
  "quick-access",
  "backend-coding",
  "graphql",
  "site-generators",
];
const learnMoreEndpointApiTypes: ApiType[] = [
  "custom-endpoints",
  "visual-layout",
];

export const ApiCard = ({ type }: Props) => {
  const location = useLocation();
  const history = useHistory();
  return (
    <Box
      width="100%"
      height="378px"
      p={2}
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      sx={{
        border: (theme: any) => `1px solid ${theme.palette.border}`,
      }}
      bgcolor="common.white"
    >
      <ApiInfo type={type} />
      <Box display="flex" gap={1.5}>
        {viewEndpointApiTypes.includes(type) && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ApiRoundedIcon />}
            onClick={() => history.push(`${location.pathname}/${type}`)}
          >
            View Endpoints
          </Button>
        )}
        {learnMoreEndpointApiTypes.includes(type) && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={() => history.push(`${location.pathname}/${type}`)}
          >
            Learn More
          </Button>
        )}
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<MenuBookRoundedIcon color="action" />}
          onClick={() => window.open(apiTypeDocsMap[type])}
        >
          Docs
        </Button>
      </Box>
    </Box>
  );
};
