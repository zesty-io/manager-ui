import { useState } from "react";

import { StarterBlockForm } from "./StarterBlockForm";
import { StarterBlocksSelection } from "./StarterBlocksSelection";

type StarterBlocksDialogueProps = {
  onClose: () => void;
  selectBlank?: () => void;
};

const StarterBlocksDialogue: React.FC<StarterBlocksDialogueProps> = ({
  onClose,
  selectBlank,
}) => {
  const [blockType, setBlockType] = useState(null);
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

export default StarterBlocksDialogue;
