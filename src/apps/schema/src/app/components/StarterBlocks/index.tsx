import { useState } from "react";

import { StarterBlockForm } from "./StarterBlockForm";
import { StarterBlocksSelection } from "./StarterBlocksSelection";

type StarterBlocksDialogueProps = {
  onClose: () => void;
};

const StarterBlocksDialogue: React.FC<StarterBlocksDialogueProps> = ({
  onClose,
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
