import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { TYPE_TEXT, FIELD_COPY_CONFIG, FieldListData } from "../configs";
import { stringStartsWithVowel, getCategory } from "../utils";

interface Props {
  type: string;
}
export const Learn = ({ type }: Props) => {
  const [data, setData] = useState<FieldListData>({
    type: "",
    name: "",
    shortDescription: "",
    description: "",
    commonUses: [],
    proTip: "",
    subHeaderText: "",
  });

  useEffect(() => {
    if (type) {
      const category = getCategory(type);

      if (category) {
        const match = FIELD_COPY_CONFIG[category]?.find(
          (items) => items.type === type
        );

        if (Object.keys(match).length) {
          setData(match);
        }
      }
    }
  }, [type]);

  return (
    <Box>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          {stringStartsWithVowel(TYPE_TEXT[type])
            ? `What is an ${TYPE_TEXT[type]} Field?`
            : `What is a ${TYPE_TEXT[type]} Field?`}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          whiteSpace="pre-line"
        >
          {data.description}
        </Typography>
      </Box>
      <Box my={2.5}>
        <Typography variant="h6" fontWeight={600}>
          Common Uses
        </Typography>
        <Box component="ul" pl={3}>
          {data.commonUses.map((string, index) => (
            <Typography
              key={index}
              component="li"
              variant="body1"
              color="text.secondary"
            >
              {string}
            </Typography>
          ))}
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Pro Tip
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data.proTip}
        </Typography>
      </Box>
    </Box>
  );
};
