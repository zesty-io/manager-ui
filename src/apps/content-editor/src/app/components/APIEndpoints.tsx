import { useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  MenuList,
  MenuItem,
  ListItemIcon,
  Typography,
  Chip,
} from "@mui/material";
import { DesignServicesRounded, VisibilityRounded } from "@mui/icons-material";

import { AppState } from "../../../../../shell/store/types";
import { ContentItem } from "../../../../../shell/services/types";
import { useGetDomainsQuery } from "../../../../../shell/services/accounts";
import { ApiType } from "../../../../schema/src/app/components/ModelApi";

type APIEndpointsProps = {
  type: Extract<ApiType, "quick-access" | "site-generators">;
};
export const APIEndpoints = ({ type }: APIEndpointsProps) => {
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const instance = useSelector((state: AppState) => state.instance);
  const { data: domains } = useGetDomainsQuery();

  const apiTypeEndpointMap: Partial<Record<ApiType, string>> = {
    "quick-access": `/-/instant/${itemZUID}.json`,
    "site-generators": item ? `/${item?.web?.path}/?toJSON` : "/?toJSON",
  };

  const liveDomain = domains?.find((domain) => domain.branch == "live");

  return (
    <MenuList>
      <MenuItem
        onClick={() => {
          window.open(
            // @ts-expect-error config not typed
            `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`,
            "_blank"
          );
        }}
      >
        <ListItemIcon>
          <DesignServicesRounded />
        </ListItemIcon>
        <Typography
          variant="inherit"
          noWrap
          sx={{
            width: 172,
          }}
        >
          {/* @ts-expect-error config not typed */}
          {`${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`}
        </Typography>
        <Chip size="small" label="Dev" />
      </MenuItem>
      {liveDomain && (
        <MenuItem
          onClick={() => {
            window.open(
              `https://${liveDomain.domain}${apiTypeEndpointMap[type]}`,
              "_blank"
            );
          }}
        >
          <ListItemIcon>
            <VisibilityRounded />
          </ListItemIcon>
          <Typography
            variant="inherit"
            noWrap
            sx={{
              width: 172,
            }}
          >
            {`${liveDomain.domain}${apiTypeEndpointMap[type]}`}
          </Typography>
          <Chip size="small" label="Prod" />
        </MenuItem>
      )}
    </MenuList>
  );
};
