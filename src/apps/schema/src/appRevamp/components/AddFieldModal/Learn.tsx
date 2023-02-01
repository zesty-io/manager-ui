import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { TYPE_TEXT, fields_list_config, FieldListData } from "../configs";
import { stringStartsWithVowel } from "../utils";

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
  });

  useEffect(() => {
    if (type) {
      let category = "";

      switch (type) {
        case "text":
        case "textarea":
        case "wysiwyg_basic":
        case "markdown":
          category = "text";
          break;

        case "images":
          category = "media";
          break;

        case "one_to_one":
        case "one_to_many":
        case "link":
        case "internal_link":
          category = "relationship";
          break;

        case "number":
        case "currency":
          category = "numeric";
          break;

        case "date":
        case "datetime":
          category = "dateandtime";
          break;

        case "yes_no":
        case "dropdown":
        case "color":
        case "sort":
          category = "options";
          break;

        default:
          category = "";
          break;
      }

      if (category) {
        const match = fields_list_config[category]?.find(
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
