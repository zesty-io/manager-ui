import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Dialog, Typography, MobileStepper } from "@mui/material";

import blocksOnboarding1 from "../../../../public/images/blocksOnboarding1.png";
import blocksOnboarding2 from "../../../../public/images/blocksOnboarding2.png";
import blocksOnboarding3 from "../../../../public/images/blocksOnboarding3.png";

const stepMapping = [
  {
    image: blocksOnboarding1,
    title: "Introducing Blocks",
    description:
      "Create and add editable blocks (e.g. Hero, Testimonial, Forms, etc.) to any existing page of your website with a few clicks",
  },
  {
    image: blocksOnboarding2,
    title: "How to Create a Block",
    description:
      "Create a block model in Schema and define the editable fields. And then connect these fields in the code template for your block.",
  },
  {
    image: blocksOnboarding3,
    title: "Create & Add Block Variants to Any Web Page",
    description:
      "Variants of these blocks can be created in the Blocks app and added to webpages using a Block Content field or with Freestyle.",
  },
];

export const OnboardingDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  return (
    <Dialog
      open
      fullWidth
      maxWidth={false}
      data-cy="onboarding-dialog"
      sx={{
        "& .MuiDialog-paper": {
          p: 6,
          width: 736,
          maxWidth: "736px",
          textAlign: "center",
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        component="img"
        width={640}
        height={480}
        src={stepMapping[step].image}
      ></Box>
      <Typography variant="h5" fontWeight={700} mt={4}>
        {stepMapping[step].title}
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        {stepMapping[step].description}
      </Typography>
      <MobileStepper
        variant="dots"
        steps={stepMapping.length}
        position="static"
        activeStep={step}
        sx={{
          mt: 3,
          justifyContent: "center",
          "& .MuiMobileStepper-dots": {
            gap: 4,
            alignItems: "center",
          },
          "& .MuiMobileStepper-dot": {
            width: 6,
            height: 6,
            "&.MuiMobileStepper-dotActive": {
              width: 12,
              height: 12,
            },
          },
        }}
        backButton={<></>}
        nextButton={<></>}
      />
      <Box sx={{ mt: 3 }} display="flex" justifyContent="center" gap={1.5}>
        {step > 0 && (
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => {
              setStep(step - 1);
            }}
          >
            {t("common.back")}
          </Button>
        )}
        <Button
          variant="contained"
          size="large"
          data-cy="onboarding-next-button"
          onClick={() => {
            if (step === stepMapping.length - 1) {
              onClose();
            } else {
              setStep(step + 1);
            }
          }}
        >
          {step === stepMapping.length - 1
            ? t("common.done")
            : t("common.next")}
        </Button>
      </Box>
    </Dialog>
  );
};
