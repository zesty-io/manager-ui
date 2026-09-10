import { TextField } from "@mui/material";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { isEmpty } from "lodash";

type PromptComposerProps = {
  seed: string;
  disabled: boolean;
  onSubmit: (value: string) => void;
  onHasValueChange: (hasValue: boolean) => void;
};

export type PromptComposerHandle = {
  submit: () => void;
};

export const PromptComposer = memo(
  forwardRef<PromptComposerHandle, PromptComposerProps>(
    ({ seed, disabled, onSubmit, onHasValueChange }, ref) => {
      const [draft, setDraft] = useState(seed);
      const inputRef = useRef<HTMLInputElement>(null);
      const hasValueRef = useRef(false);

      useEffect(() => {
        setDraft(seed);
        if (seed) {
          inputRef.current?.focus();
        }
      }, [seed]);

      // Only notifies the parent when emptiness actually flips, not on every
      // keystroke, so the parent (a long chat thread) doesn't re-render while typing.
      useEffect(() => {
        const hasValue = !isEmpty(draft.trim());
        if (hasValueRef.current !== hasValue) {
          hasValueRef.current = hasValue;
          onHasValueChange(hasValue);
        }
      }, [draft, onHasValueChange]);

      const submitDraft = useCallback(() => {
        if (!draft.trim()) {
          return;
        }
        onSubmit(draft);
        setDraft("");
      }, [draft, onSubmit]);

      useImperativeHandle(ref, () => ({ submit: submitDraft }), [submitDraft]);

      return (
        <TextField
          data-cy="AIDrawerComposer"
          inputRef={inputRef}
          disabled={disabled}
          placeholder={`Ask for anything, for example "Cater my content to a specific audience"`}
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          onChange={(e) => setDraft(e.target.value)}
          value={draft}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitDraft();
            }
          }}
        />
      );
    }
  )
);
PromptComposer.displayName = "PromptComposer";
