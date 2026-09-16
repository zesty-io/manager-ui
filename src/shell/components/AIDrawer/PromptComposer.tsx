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
import { useTranslation } from "react-i18next";

type PromptComposerProps = {
  seed: string;
  disabled: boolean;
  // Returns whether the prompt was actually sent, so the draft is only
  // cleared on a real send (e.g. not when the caller silently bails out
  // because required data, like the user's role, hasn't loaded yet).
  onSubmit: (value: string) => boolean;
  onHasValueChange: (hasValue: boolean) => void;
};

export type PromptComposerHandle = {
  submit: () => void;
};

export const PromptComposer = memo(
  forwardRef<PromptComposerHandle, PromptComposerProps>(
    ({ seed, disabled, onSubmit, onHasValueChange }, ref) => {
      const { t } = useTranslation();
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
        if (onSubmit(draft)) {
          setDraft("");
        }
      }, [draft, onSubmit]);

      useImperativeHandle(ref, () => ({ submit: submitDraft }), [submitDraft]);

      return (
        <TextField
          data-cy="AIDrawerComposer"
          inputRef={inputRef}
          disabled={disabled}
          placeholder={t("shell.aiDrawerPlaceholder")}
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
