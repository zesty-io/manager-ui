import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { ContentModel } from "../../../shell/services/types";
import { useGetContentModelItemsQuery } from "../../../shell/services/instance";
import blockPlaceholder from "../../../../public/images/blockPlaceholder.png";
import { useHistory } from "react-router";

type BlockCardProps = {
  model: ContentModel;
};

export const BlockCard = ({ model }: BlockCardProps) => {
  const history = useHistory();
  const { data, isLoading } = useGetContentModelItemsQuery({
    modelZUID: model.ZUID,
    params: {
      limit: 1,
    },
  });
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <Box
      sx={{
        borderColor: "border",
        borderStyle: "solid",
        borderWidth: "1px",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      onClick={() => {
        history.push(`/blocks/${model.ZUID}`);
      }}
    >
      <Box p={1}>
        <Box
          ref={imageRef}
          component="img"
          src={(data?.[0]?.data?.og_image as string) || blockPlaceholder}
          height={144}
          width="100%"
          alt="Block Image"
          sx={{
            objectFit: "contain",
          }}
          onError={() => {
            imageRef.current.src = blockPlaceholder;
          }}
        />
      </Box>
      <Box
        bgcolor="white"
        py={2}
        px={1}
        sx={{
          borderRadius: "0 0 4px 4px",
        }}
      >
        <Typography variant="body2" noWrap>
          {model.label}
        </Typography>
      </Box>
    </Box>
  );
};
