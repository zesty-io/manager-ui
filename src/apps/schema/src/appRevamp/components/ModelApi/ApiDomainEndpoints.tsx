import { Box, Link, Typography } from "@mui/material";
import { ApiType } from ".";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useGetDomainsQuery } from "../../../../../../shell/services/accounts";

type Props = {
  type: ApiType;
  contentModelZUID: string;
};

export const ApiDomainEndpoints = ({ type, contentModelZUID }: Props) => {
  const instance = useSelector((state: AppState) => state.instance);
  const { data: domains } = useGetDomainsQuery();
  const apiTypeEndpointMap: Record<ApiType, string> = {
    "quick-access": `/-/instant/${contentModelZUID}.json`,
    "site-generators": "/?toJSON",
    graphql: "/-/gql/homepage.json",
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
          <Link
            href={`https://${instance.ZUID}.api.zesty.io/v1/content/models/${contentModelZUID}/items`}
            target="_blank"
          >{`${instance.ZUID}.api.zesty.io/v1/content/models/${contentModelZUID}/items`}</Link>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Rest Endpoint (needs authentication bearer)
          </Typography>
          <Link
            href="https://www.npmjs.com/package/@zesty-io/sdk"
            target="_blank"
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
              {/* @ts-ignore */}
              <li>{`${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`}</li>
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
                >
                  <li>{`${domain.domain}${apiTypeEndpointMap[type]}`}</li>
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
                  <li>{`${domain.domain}${apiTypeEndpointMap[type]}`}</li>
                </Link>
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
