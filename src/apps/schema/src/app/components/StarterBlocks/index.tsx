import { Suspense, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { STARTER_BLOCKS } from "./configs";

import { StarterBlockForm } from "./StarterBlockForm";
import { StarterBlocksSelection } from "./StarterBlocksSelection";

type StarterBlocksDialogueProps = {
  onClose: () => void;
  selectBlank?: () => void;
};

const StarterBlocksDialogueInner: React.FC<StarterBlocksDialogueProps> = ({
  onClose,
  selectBlank,
}) => {
  useTranslation("schema");

  const [blockType, setBlockType] = useState(STARTER_BLOCKS[0]);
  const [activeStep, setActiveStep] = useState<"selection" | "form">(
    "selection"
  );

  return (
    <>
      {activeStep === "selection" ? (
        <StarterBlocksSelection
          onClose={onClose}
          setActiveStep={setActiveStep}
          selectBlockType={setBlockType}
          selectBlank={selectBlank}
          blockType={blockType}
        />
      ) : activeStep === "form" ? (
        <StarterBlockForm
          block={blockType}
          onClose={onClose}
          setActiveStep={setActiveStep}
        />
      ) : null}
    </>
  );
};

const StarterBlocksDialogue: React.FC<StarterBlocksDialogueProps> = (props) => (
  <Suspense
    fallback={<Box sx={{ height: "100%", backgroundColor: "grey.50" }} />}
  >
    <StarterBlocksDialogueInner {...props} />
  </Suspense>
);

export default StarterBlocksDialogue;
