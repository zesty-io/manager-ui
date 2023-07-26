import { Box, Link, Typography } from "@mui/material";
import { ApiType } from ".";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useGetDomainsQuery } from "../../../../../../shell/services/accounts";
import { useParams } from "react-router";
import {
  useGetContentItemQuery,
  useGetContentModelQuery,
} from "../../../../../../shell/services/instance";

type Props = {
  type: ApiType;
};

export const ApiDomainEndpoints = ({ type }: Props) => {
  const instance = useSelector((state: AppState) => state.instance);
  const { data: domains } = useGetDomainsQuery();

  const { contentModelZUID, contentItemZUID } = useParams<{
    contentModelZUID: string;
    contentItemZUID: string;
  }>();

  const { data: modelData } = useGetContentModelQuery(contentModelZUID, {
    skip: !contentModelZUID,
  });

  const { data: itemData } = useGetContentItemQuery(contentItemZUID, {
    skip: !contentItemZUID,
  });

  const apiTypeEndpointMap: Partial<Record<ApiType, string>> = {
    "quick-access": `/-/instant/${
      contentItemZUID ? contentItemZUID : contentModelZUID
    }.json`,
    "site-generators": itemData
      ? `/${itemData?.web?.pathPart}/?toJSON`
      : "/?toJSON",
    graphql: `/-/gql/${modelData?.name}.json`,
    "backend-coding": `https://${
      instance.ZUID
    }.api.zesty.io/v1/content/models/${contentModelZUID}/items${
      contentItemZUID ? `/${contentItemZUID}` : ""
    }`,
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        View Endpoints
      </Typography>
      {type === "backend-coding" ? (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Rest Endpoint (needs authentication bearer)
          </Typography>
          <Link variant="body2" href={apiTypeEndpointMap[type]} target="_blank">
            {apiTypeEndpointMap[type]}
          </Link>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Rest Endpoint (needs authentication bearer)
          </Typography>
          <Link
            href="https://www.npmjs.com/package/@zesty-io/sdk"
            target="_blank"
            variant="body2"
          >
            www.npmjs.com/package/@zesty-io/sdk
          </Link>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Dev (latest version)
          </Typography>
          <Box
            component="ul"
            sx={{
              listStylePosition: "inside",
            }}
          >
            <Link
              // @ts-ignore
              href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`}
              target="_blank"
            >
              <Typography
                component="li"
                variant="body2"
                // @ts-ignore
              >{`${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`}</Typography>
            </Link>
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Stage
          </Typography>
          <Box
            component="ul"
            sx={{
              listStylePosition: "inside",
            }}
          >
            {domains
              ?.filter((domain) => domain.branch == "dev")
              ?.map((domain) => (
                <Link
                  key={domain.ZUID}
                  href={`https://${domain.domain}${apiTypeEndpointMap[type]}`}
                  target="_blank"
                  variant="body2"
                >
                  <Typography
                    component="li"
                    variant="body2"
                  >{`${domain.domain}${apiTypeEndpointMap[type]}`}</Typography>
                </Link>
              ))}
          </Box>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Production
          </Typography>
          <Box
            component="ul"
            sx={{
              listStylePosition: "inside",
            }}
          >
            {domains
              ?.filter((domain) => domain.branch == "live")
              ?.map((domain) => (
                <Link
                  key={domain.ZUID}
                  href={`https://${domain.domain}${apiTypeEndpointMap[type]}`}
                  target="_blank"
                >
                  <Typography
                    component="li"
                    variant="body2"
                  >{`${domain.domain}${apiTypeEndpointMap[type]}`}</Typography>
                </Link>
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
