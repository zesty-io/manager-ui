import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_TYPE_NAMES,
  AttachmentRefusal,
  AttachmentRefusalReason,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MB,
  PromptAttachment,
  PromptImage,
  validateAttachments,
} from "./attachments";
import { useAttachmentUpload } from "./useAttachmentUpload";

const REFUSAL_KEYS: Record<AttachmentRefusalReason, string> = {
  count: "shell.aiAttachTooMany",
  size: "shell.aiAttachTooLarge",
  total: "shell.aiAttachTotalTooLarge",
  type: "shell.aiAttachUnsupportedType",
};

let attachmentSeq = 0;

// The composer's picked images: refused before upload when over the limits,
// and uploaded only when the prompt is sent.
export const usePromptAttachments = () => {
  const uploadImage = useAttachmentUpload();
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [refusals, setRefusals] = useState<AttachmentRefusal[]>([]);
  const [failedFilenames, setFailedFilenames] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  const isUploadingRef = useRef(false);

  useEffect(
    () => () =>
      attachmentsRef.current.forEach((attachment) =>
        URL.revokeObjectURL(attachment.previewUrl)
      ),
    []
  );

  const addFiles = useCallback((files: File[]) => {
    const { accepted, refusals } = validateAttachments(
      attachmentsRef.current.map((attachment) => attachment.file),
      files
    );
    setRefusals(refusals);
    setFailedFilenames([]);
    setAttachments((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        id: `attachment-${++attachmentSeq}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setRefusals([]);
    setFailedFilenames([]);
    setAttachments((prev) =>
      prev.filter((attachment) => {
        if (attachment.id !== id) return true;
        URL.revokeObjectURL(attachment.previewUrl);
        return false;
      })
    );
  }, []);

  const clearAttachments = useCallback(() => {
    attachmentsRef.current.forEach((attachment) =>
      URL.revokeObjectURL(attachment.previewUrl)
    );
    setAttachments([]);
    setRefusals([]);
    setFailedFilenames([]);
  }, []);

  // Uploads every attachment not yet uploaded, in parallel. Resolves with
  // all of them, or with null when any failed, naming those in the composer.
  const uploadAttachments = useCallback(async (): Promise<
    PromptImage[] | null
  > => {
    if (isUploadingRef.current) return null;
    const pending = attachmentsRef.current;
    isUploadingRef.current = true;
    setIsUploading(true);
    setRefusals([]);
    setFailedFilenames([]);

    const results = await Promise.allSettled(
      pending.map(
        (attachment) => attachment.uploaded ?? uploadImage(attachment.file)
      )
    );
    isUploadingRef.current = false;
    setIsUploading(false);

    const uploadedById = new Map<string, PromptImage>();
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        uploadedById.set(pending[index].id, result.value);
      }
    });
    setAttachments((prev) =>
      prev.map((attachment) =>
        uploadedById.has(attachment.id)
          ? { ...attachment, uploaded: uploadedById.get(attachment.id) }
          : attachment
      )
    );

    const failed = pending.filter(
      (attachment) => !uploadedById.has(attachment.id)
    );
    if (failed.length) {
      setFailedFilenames(failed.map((attachment) => attachment.file.name));
      return null;
    }
    return results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : []
    );
  }, [uploadImage]);

  return {
    attachments,
    refusals,
    failedFilenames,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    uploadAttachments,
  };
};

type AttachImagesButtonProps = {
  disabled: boolean;
  onFiles: (files: File[]) => void;
};

export const AttachImagesButton = ({
  disabled,
  onFiles,
}: AttachImagesButtonProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Tooltip title={t("shell.aiAttachImages")} placement="top">
        <span>
          <IconButton
            data-cy="AIDrawerAttach"
            data-amp-track-id="ai-drawer-attach-button"
            aria-label={t("shell.aiAttachImages")}
            size="small"
            disabled={disabled}
            onClick={() => {
              // Lets the same file be picked again after it is removed.
              if (inputRef.current) inputRef.current.value = "";
              inputRef.current?.click();
            }}
          >
            <AttachFileRoundedIcon color="action" fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <input
        data-cy="AIDrawerAttachInput"
        ref={inputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        hidden
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFiles(Array.from(event.target.files || []))
        }
      />
    </>
  );
};

// A picked image, or its name when the browser cannot show it (HEIC/HEIF).
const AttachmentThumbnail = ({
  attachment,
  disabled,
  onRemove,
}: {
  attachment: PromptAttachment;
  disabled: boolean;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const [canPreview, setCanPreview] = useState(true);
  const filename = attachment.file.name;

  return (
    <Tooltip title={filename} placement="top">
      <Box
        data-cy="AIDrawerAttachment"
        position="relative"
        width={48}
        height={48}
        flexShrink={0}
        borderRadius={1}
        border={1}
        borderColor="border"
        overflow="hidden"
        bgcolor="grey.100"
      >
        {canPreview ? (
          <Box
            component="img"
            src={attachment.previewUrl}
            alt={filename}
            width="100%"
            height="100%"
            display="block"
            sx={{ objectFit: "cover" }}
            onError={() => setCanPreview(false)}
          />
        ) : (
          <Stack
            width="100%"
            height="100%"
            alignItems="center"
            justifyContent="center"
            px={0.5}
          >
            <ImageRoundedIcon color="action" fontSize="small" />
            <Typography variant="body3" color="text.secondary" noWrap>
              {filename}
            </Typography>
          </Stack>
        )}
        <IconButton
          data-cy="AIDrawerAttachmentRemove"
          aria-label={t("shell.aiAttachmentRemove", { filename })}
          size="small"
          disabled={disabled}
          onClick={() => onRemove(attachment.id)}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            p: 0.25,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

type PromptAttachmentListProps = {
  attachments: PromptAttachment[];
  disabled: boolean;
  onRemove: (id: string) => void;
};

export const PromptAttachmentList = ({
  attachments,
  disabled,
  onRemove,
}: PromptAttachmentListProps) => {
  if (!attachments.length) return null;

  return (
    <Stack
      data-cy="AIDrawerAttachments"
      direction="row"
      gap={1}
      flexWrap="wrap"
    >
      {attachments.map((attachment) => (
        <AttachmentThumbnail
          key={attachment.id}
          attachment={attachment}
          disabled={disabled}
          onRemove={onRemove}
        />
      ))}
    </Stack>
  );
};

type PromptAttachmentStatusProps = {
  refusals: AttachmentRefusal[];
  failedFilenames: string[];
  isUploading: boolean;
};

// Why a file was refused or failed to upload, said under the composer.
export const PromptAttachmentStatus = ({
  refusals,
  failedFilenames,
  isUploading,
}: PromptAttachmentStatusProps) => {
  const { t } = useTranslation();

  if (isUploading) {
    return (
      <Typography
        data-cy="AIDrawerAttachUploading"
        variant="caption"
        color="text.secondary"
      >
        {t("shell.aiAttachUploading")}
      </Typography>
    );
  }
  if (!refusals.length && !failedFilenames.length) return null;

  return (
    <Stack gap={0.5}>
      {refusals.map(({ filename, reason }, index) => (
        <Typography
          data-cy="AIDrawerAttachError"
          key={`${filename}-${index}`}
          variant="caption"
          color="error"
        >
          {t(REFUSAL_KEYS[reason], {
            filename,
            max: MAX_ATTACHMENTS,
            maxMb: MAX_ATTACHMENT_MB,
            types: ATTACHMENT_TYPE_NAMES,
          })}
        </Typography>
      ))}
      {!!failedFilenames.length && (
        <Typography
          data-cy="AIDrawerAttachError"
          variant="caption"
          color="error"
        >
          {t("shell.aiAttachUploadFailed", {
            filename: failedFilenames.join(", "),
          })}
        </Typography>
      )}
    </Stack>
  );
};

// One sent image, or an image icon when it cannot be shown (HEIC/HEIF, or a
// file since removed from the media library).
const SentImage = ({ image }: { image: PromptImage }) => {
  const { t } = useTranslation();
  const [canPreview, setCanPreview] = useState(true);

  if (!canPreview) {
    return (
      <Stack
        data-cy="AIDrawerUserInputImage"
        role="img"
        aria-label={t("shell.aiAttachedImage")}
        width={76}
        height={76}
        alignItems="center"
        justifyContent="center"
        borderRadius={1}
        bgcolor="grey.200"
      >
        <ImageRoundedIcon color="action" />
      </Stack>
    );
  }

  return (
    <Box
      data-cy="AIDrawerUserInputImage"
      component="img"
      src={`${image.url}?width=200`}
      alt={t("shell.aiAttachedImage")}
      width={76}
      height={76}
      display="block"
      borderRadius={1}
      sx={{ objectFit: "cover" }}
      onError={() => setCanPreview(false)}
    />
  );
};

// A sent prompt's images, in its transcript bubble. The CDN URL needs no
// token, so a plain <img> shows it.
export const PromptImages = ({ images }: { images: PromptImage[] }) => (
  <Stack direction="row" gap={0.5} flexWrap="wrap" mb={1}>
    {images.map((image, index) => (
      <SentImage key={`${image.url}-${index}`} image={image} />
    ))}
  </Stack>
);
