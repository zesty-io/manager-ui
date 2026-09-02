import { Box, Paper, Typography, Avatar } from "@mui/material";
import Link from "@mui/material/Link";
import { useTranslation, Trans } from "react-i18next";

type ExternalLinkProps = {
  href: string;
  text: string;
  target?: string;
};

const ExternalLink = ({ href, text, target = "_blank" }: ExternalLinkProps) => {
  return (
    <Typography
      component={Link}
      href={href}
      target={target}
      variant="body3"
      color="info.main"
    >
      {text}
    </Typography>
  );
};

export const DevResources = () => {
  const { t } = useTranslation();
  return (
    <Box data-cy="AllFilesDevResources">
      <Typography variant="h5" mb="20px" color="common.white">
        {t("code.developerResources")}
      </Typography>
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          p: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          backgroundColor: "transparent",
          color: "grey.400",
          borderColor: "grey.700",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h6" color="common.white">
          {t("code.buildFasterHeading")} 🚀
        </Typography>

        <Typography variant="body3" color="grey.400">
          <Trans
            i18nKey="code.buildFasterBody"
            components={{
              parsleyLink: (
                <ExternalLink
                  href="https://docs.zesty.io/docs/parsley"
                  text="Parsley"
                />
              ),
              replLink: (
                <ExternalLink href="https://parsley.zesty.io/" text="REPL" />
              ),
              docsLink: (
                <ExternalLink
                  href="https://docs.zesty.io/docs/parsley-index"
                  text="documentation"
                />
              ),
            }}
          />
        </Typography>

        <Typography variant="h6" color="common.white">
          {t("code.simplifyWorkflowHeading")}
        </Typography>

        <Typography variant="body3" color="grey.400">
          <Trans
            i18nKey="code.simplifyWorkflowBody"
            components={{
              preprocessingLink: (
                <ExternalLink
                  href="https://docs.zesty.io/docs/css-js-processing-flow"
                  text="CSS & JavaScript preprocessing"
                />
              ),
            }}
          />
        </Typography>

        <Box display="flex" flexDirection="column">
          <Typography variant="h6" color="common.white" mb="8px">
            {t("code.apiDocs")}
          </Typography>
          <Box
            component={Link}
            href="https://docs.zesty.io/reference/instances-api-reference"
            target="_blank"
            display="flex"
            flexDirection="row"
            alignItems="center"
            columnGap="12px"
            py="4px"
            height="36px"
            borderBottom="1px solid"
            borderColor="grey.700"
            sx={{
              textDecoration: "none!important",
            }}
          >
            <Avatar
              src="/images/postmanIcon.svg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" color="common.white">
              {t("common.instanceApiDocs")}
            </Typography>
          </Box>
          <Box
            component={Link}
            href="https://docs.zesty.io/docs/graphql#GraphQL"
            target="_blank"
            display="flex"
            flexDirection="row"
            alignItems="center"
            columnGap="12px"
            py="4px"
            height="36px"
            borderBottom="1px solid"
            borderColor="grey.700"
            sx={{
              textDecoration: "none!important",
            }}
          >
            <Avatar
              src="/images/graphQLIcon.svg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" color="common.white">
              {t("common.graphqlDocs")}
            </Typography>
          </Box>
          <Box
            component={Link}
            href="https://docs.zesty.io/docs/parsley"
            target="_blank"
            display="flex"
            flexDirection="row"
            alignItems="center"
            columnGap="12px"
            py="4px"
            height="36px"
            borderBottom="1px solid"
            borderColor="grey.700"
            sx={{
              textDecoration: "none!important",
            }}
          >
            <Avatar
              src="/images/parsleyIcon.svg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" color="common.white">
              {t("common.parsleyDocs")}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
