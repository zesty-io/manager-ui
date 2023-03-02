import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";

export const ComingSoon = () => {
  return (
    <Box
      data-cy="RulesTab"
      display="flex"
      flexDirection="column"
      // height="100%"
      // height={600}
      justifyContent="center"
      alignItems="center"
      // position="absolute"
      // top={0}
      // left={0}
      // right={0}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">Unique Field</Typography>
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                Ensures that multiple items can't have the same value for this
                field
              </Typography>
            </>
          }
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">Default Value</Typography>
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                Ensures that multiple items can't have the same value for this
                field
              </Typography>
            </>
          }
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">Limit character count</Typography>
              <Typography
                // @ts-expect-error body3 module augmentation required
                variant="body3"
                color="text.secondary"
              >
                Specifies a minimum and/or maximum allowed number of characters
              </Typography>
            </>
          }
        />
      </Box>
      <Typography variant="h5" mt={4} mb={1.5} fontWeight={600}>
        Field Validation, Defaults, & More
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Coming Soon
      </Typography>
    </Box>
  );
};
