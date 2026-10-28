import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useGenerateAltTextMutation } from "../../services/mcp";
import { useUpdateFileAltTextMutation } from "../../services/mediaManager";

// The alt-text endpoint rejects a longer `context`.
const MAX_CONTEXT_LENGTH = 500;

export type GenerateAltTextResult =
  // `chatError` is set when the server did not log the turn to `chatZuid`.
  | { ok: true; altText: string; chatError?: string }
  | { ok: false; message: string };

// Generates alt text for a media file and saves it as the file's alt text,
// which the media app stores in `title`. Nothing is written when generation
// fails.
export const useGenerateAltText = () => {
  const { t } = useTranslation();
  const [generateAltText, { isLoading: isGenerating }] =
    useGenerateAltTextMutation();
  const [updateFileAltText, { isLoading: isSaving }] =
    useUpdateFileAltTextMutation();

  const generate = useCallback(
    async ({
      fileZuid,
      context,
      chatZuid,
    }: {
      fileZuid: string;
      context?: string;
      chatZuid?: string;
    }): Promise<GenerateAltTextResult> => {
      let altText: string;
      let chatError: string | undefined;
      try {
        // A `chatError` only means the turn was not logged; the text is good.
        const response = await generateAltText({
          fileZuid,
          context: context?.slice(0, MAX_CONTEXT_LENGTH) || undefined,
          chatZuid,
        }).unwrap();
        altText = response.data.altText;
        chatError = response.chatError;
      } catch (error) {
        const serverMessage = (error as { data?: { message?: unknown } })?.data
          ?.message;
        return {
          ok: false,
          message:
            typeof serverMessage === "string" && serverMessage
              ? serverMessage
              : t("shell.altTextGenerateFailed"),
        };
      }

      try {
        await updateFileAltText({
          id: fileZuid,
          body: { title: altText },
        }).unwrap();
      } catch {
        return { ok: false, message: t("shell.altTextSaveFailed") };
      }

      return { ok: true, altText, chatError };
    },
    [generateAltText, updateFileAltText, t]
  );

  return { generate, isLoading: isGenerating || isSaving };
};
