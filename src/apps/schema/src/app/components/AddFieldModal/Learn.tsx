import { Box, Typography, Stack } from "@mui/material";

import { TYPE_TEXT, FIELD_COPY_CONFIG, FieldType } from "../configs";
import { stringStartsWithVowel, getCategory } from "../../utils";

interface Props {
  type: FieldType;
}
export const Learn = ({ type }: Props) => {
  const category = getCategory(type);
  const data = FIELD_COPY_CONFIG[category]?.find((item) => item.type === type);

  return (
    <Stack data-cy="LearnTab" gap={1.25}>
      <Box>
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          {stringStartsWithVowel(TYPE_TEXT[type])
            ? `What is an ${TYPE_TEXT[type]} Field?`
            : `What is a ${TYPE_TEXT[type]} Field?`}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          whiteSpace="pre-line"
        >
          {data?.description}
        </Typography>
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          Common Uses
        </Typography>
        <Box component="ul" pl={3}>
          {data?.commonUses.map((string, index) => (
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
      {type === "repeater" && (
        <Box>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            How is the Data Stored?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={0.5}>
            Data is stored as a JSON array of objects, which can be accessed
            easily, both directly and through Parsley with each statement.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {
              'e.g. [{quote: "ACME has solved all my needs", name: "Jane Doe"}, {quote: "I love ACME!", name: "John Doe"}]'
            }
          </Typography>
        </Box>
      )}
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          Pro Tip
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data?.proTip}
        </Typography>
      </Box>
    </Stack>
  );
};
