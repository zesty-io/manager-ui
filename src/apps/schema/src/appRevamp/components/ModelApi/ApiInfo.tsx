import { ReactNode } from "react";
import { ApiType, apiTypeLabelMap } from ".";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import DataSaverOnRoundedIcon from "@mui/icons-material/DataSaverOnRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import { Box, Chip, SvgIcon, Typography, Link } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import { createSvgIcon } from "@mui/material/utils";

type ApiTypeInfo = {
  title: string;
  tag: string;
  description: string | ReactNode;
  uses: string[];
  icon: SvgIconComponent;
  iconBgColor: string;
};

const GraphQlIcon = createSvgIcon(
  <>
    <path
      d="M3.58575 17.0595L12.174 2.18555L12.945 2.6303L4.3575 17.505L3.58575 17.0595Z"
      fill="currentColor"
    />
    <path
      d="M3.40875 15.8716H20.5853V16.7618H3.40875V15.8716Z"
      fill="currentColor"
    />
    <path
      d="M3.74927 16.3711L4.19402 15.6001L12.7853 20.5606L12.3398 21.3316L3.74927 16.3711ZM11.2125 3.44261L11.658 2.67236L20.2493 7.63286L19.8038 8.40386L11.2125 3.44261Z"
      fill="currentColor"
    />
    <path
      d="M3.75153 7.63042L12.342 2.66992L12.7875 3.44092L4.19628 8.40142L3.75153 7.63042Z"
      fill="currentColor"
    />
    <path
      d="M11.0573 2.63105L11.8283 2.18555L20.4158 17.0603L19.6455 17.505L11.0573 2.63105ZM4.09052 7.03955H4.98076V16.9605H4.09052V7.03955Z"
      fill="currentColor"
    />
    <path
      d="M19.02 7.03955H19.9103V16.9606H19.02V7.03955Z"
      fill="currentColor"
    />
    <path
      d="M11.8005 20.2813L19.272 15.9673L19.6612 16.6408L12.189 20.9548L11.8005 20.2813Z"
      fill="currentColor"
    />
    <path
      d="M21.09 17.2499C20.9049 17.5715 20.6286 17.8309 20.2961 17.9954C19.9635 18.1599 19.5896 18.222 19.2217 18.1738C18.8538 18.1257 18.5085 17.9695 18.2294 17.7251C17.9503 17.4806 17.7501 17.1588 17.6539 16.8005C17.5578 16.4421 17.5701 16.0633 17.6894 15.712C17.8087 15.3607 18.0295 15.0526 18.3239 14.8268C18.6183 14.601 18.9731 14.4677 19.3433 14.4436C19.7135 14.4196 20.0826 14.5059 20.4038 14.6917C20.8336 14.9403 21.1472 15.3493 21.2759 15.8289C21.4045 16.3085 21.3377 16.8195 21.09 17.2499ZM6.15001 8.62491C5.96495 8.94648 5.68864 9.20592 5.35607 9.37039C5.0235 9.53486 4.64961 9.59696 4.28172 9.54884C3.91384 9.50072 3.5685 9.34454 3.28942 9.10007C3.01033 8.8556 2.81005 8.53382 2.71393 8.17547C2.6178 7.81712 2.63015 7.43831 2.74941 7.08699C2.86867 6.73566 3.08948 6.42761 3.38389 6.20183C3.6783 5.97605 4.03307 5.84269 4.40331 5.81863C4.77355 5.79457 5.1426 5.88089 5.46376 6.06666C5.89358 6.3153 6.20722 6.72429 6.33588 7.20389C6.46453 7.68349 6.39768 8.19454 6.15001 8.62491ZM2.91001 17.2499C2.72423 16.9288 2.63791 16.5597 2.66197 16.1895C2.68603 15.8192 2.81939 15.4645 3.04517 15.17C3.27095 14.8756 3.579 14.6548 3.93033 14.5356C4.28165 14.4163 4.66047 14.404 5.01881 14.5001C5.37716 14.5962 5.69894 14.7965 5.94341 15.0756C6.18788 15.3547 6.34407 15.7 6.39218 16.0679C6.4403 16.4358 6.3782 16.8097 6.21373 17.1422C6.04926 17.4748 5.78982 17.7511 5.46826 17.9362C5.03788 18.1838 4.52683 18.2507 4.04723 18.122C3.56763 17.9934 3.15864 17.6797 2.91001 17.2499ZM17.85 8.62491C17.6642 8.30376 17.5779 7.93471 17.602 7.56447C17.626 7.19423 17.7594 6.83946 17.9852 6.54505C18.2109 6.25064 18.519 6.02983 18.8703 5.91057C19.2217 5.79131 19.6005 5.77896 19.9588 5.87509C20.3172 5.97121 20.6389 6.17149 20.8834 6.45058C21.1279 6.72966 21.2841 7.075 21.3322 7.44288C21.3803 7.81077 21.3182 8.18466 21.1537 8.51723C20.9893 8.8498 20.7298 9.1261 20.4083 9.31116C19.9779 9.55884 19.4668 9.62569 18.9872 9.49704C18.5076 9.36838 18.0986 9.05474 17.85 8.62491ZM12 22.4999C11.6292 22.4999 11.2667 22.3899 10.9583 22.1839C10.65 21.9779 10.4096 21.6851 10.2677 21.3424C10.1258 20.9998 10.0887 20.6228 10.161 20.2591C10.2334 19.8954 10.412 19.5613 10.6742 19.2991C10.9364 19.0369 11.2705 18.8583 11.6342 18.7859C11.9979 18.7136 12.3749 18.7507 12.7175 18.8926C13.0601 19.0346 13.353 19.2749 13.559 19.5832C13.765 19.8916 13.875 20.2541 13.875 20.6249C13.8757 20.8713 13.8277 21.1155 13.7337 21.3433C13.6397 21.5711 13.5016 21.778 13.3274 21.9523C13.1531 22.1265 12.9462 22.2646 12.7184 22.3586C12.4906 22.4526 12.2464 22.5006 12 22.4999ZM12 5.24317C11.6292 5.24317 11.2667 5.1332 10.9583 4.92717C10.65 4.72114 10.4096 4.42831 10.2677 4.0857C10.1258 3.74308 10.0887 3.36608 10.161 3.00237C10.2334 2.63866 10.412 2.30456 10.6742 2.04234C10.9364 1.78012 11.2705 1.60154 11.6342 1.52919C11.9979 1.45685 12.3749 1.49398 12.7175 1.63589C13.0601 1.77781 13.353 2.01813 13.559 2.32647C13.765 2.63481 13.875 2.99733 13.875 3.36817C13.8757 3.61459 13.8277 3.85872 13.7337 4.08652C13.6397 4.31431 13.5016 4.52129 13.3274 4.69554C13.1531 4.86978 12.9462 5.00787 12.7184 5.10185C12.4906 5.19583 12.2464 5.24386 12 5.24317Z"
      fill="currentColor"
    />
  </>,
  "GraphQlIcon"
);

type Props = {
  type: ApiType;
  large?: boolean;
};

export const ApiInfo = ({ type, large }: Props) => {
  const apiTypeInfoMap: Record<ApiType, ApiTypeInfo> = {
    "quick-access": {
      title: apiTypeLabelMap["quick-access"],
      tag: "Read Only",
      description: (
        <span>
          <Link
            href="https://zesty.org/apis/instant-content-api"
            target="_blank"
          >
            Zesty's Instant API
          </Link>{" "}
          gives access to full models Items or single items JSON endpoints with
          all kinds of information. Data requires manually hydration.
        </span>
      ),
      uses: ["Mobile Applications", "Headless Applets"],
      icon: BoltRoundedIcon,
      iconBgColor: "yellow.400",
    },
    "backend-coding": {
      title: apiTypeLabelMap["backend-coding"],
      tag: "Read and Write",
      description:
        "Zesty's REST API grants full access to Create, Read, Update, Delete, and Publish Commands. API can be accessed through direct API calls or from our Node SDK.",
      uses: ["Automation", "User Generated Content", "Custom Apps"],
      icon: DataObjectRoundedIcon,
      iconBgColor: "blue.500",
    },
    graphql: {
      title: apiTypeLabelMap["graphql"],
      tag: "Read Only",
      description:
        "Flat object endpoints ideal for feeding GraphQL servers. Only accessible by traversing through the data on the model's GQL endpoint.",
      uses: [
        "GraphQL Implementations",
        "Middleware",
        "Apps or headless layouts",
      ],
      icon: GraphQlIcon,
      iconBgColor: "pink.500",
    },
    "site-generators": {
      title: apiTypeLabelMap["site-generators"],
      tag: "Read Only",
      description:
        "Zesty converts each URL to JSON with hydrated relationships and navigation information. Every content item added to this model has access to hydrated JSON URLs.",
      uses: ["Headless Web Development", "Applications with routing"],
      icon: DataObjectRoundedIcon,
      iconBgColor: "purple.500",
    },
    "custom-endpoints": {
      title: apiTypeLabelMap["custom-endpoints"],
      tag: "Read Only",
      description:
        "Build any data type (JSON, XML, HTML, etc) and any hydration level with Zestyi.io Parsley and Webengine.",
      uses: ["Search", "Custom Content Hydration", "Fully painted HTML views"],
      icon: DataSaverOnRoundedIcon,
      iconBgColor: "green.500",
    },
    "visual-layout": {
      title: apiTypeLabelMap["visual-layout"],
      tag: "Read Only",
      description:
        "Visual layout is accessible from rendered HTML or structured JSON from the toJSON endpoint.",
      uses: ["Automation Design", "Content Experiences"],
      icon: NewspaperRoundedIcon,
      iconBgColor: "deepPurple.500",
    },
  };

  const { title, tag, description, uses, icon, iconBgColor } =
    apiTypeInfoMap[type];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Box
          bgcolor={iconBgColor}
          borderRadius="50%"
          width="48px"
          height="48px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <SvgIcon sx={{ color: "common.white" }} component={icon} />
        </Box>
        {!large && <Chip label={tag} size="small" />}
      </Box>
      <Typography
        variant={large ? "h5" : "h6"}
        fontWeight={600}
        mt={2}
        mb={1.5}
      >
        {title}
      </Typography>
      <Typography variant={large ? "body1" : "body2"} color="text.secondary">
        {description}
      </Typography>
      <br />
      <Typography variant={large ? "body1" : "body2"} fontWeight={700}>
        Best used for:
      </Typography>
      <Box
        component="ul"
        sx={{
          listStylePosition: "inside",
        }}
      >
        {uses.map((use) => (
          <Typography
            key={use}
            variant={large ? "body1" : "body2"}
            component="li"
            color="text.secondary"
          >
            {use}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
