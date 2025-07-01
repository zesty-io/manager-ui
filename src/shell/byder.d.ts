type BynderFile = Readonly<{
  fileSize: null | number;
  height: null | number;
  width: null | number;
  url: string;
}>;

type BynderImage = Readonly<{
  createdAt: string;
  databaseId: string;
  derivatives: Record<string, string>;
  description: string;
  extensions: string[];
  files: Record<string, BynderFile>;
  id: string;
  name: string;
  originalUrl: string;
  publishedAt: string;
  tags: string[];
  type: string;
  updatedAt: string;
  url: string;
}>;

type BynderMode = "MultiSelect" | "SingleSelect" | "SingleSelectFile";

declare const BynderCompactView: Readonly<{
  open: (
    options: Readonly<{
      onSuccess?: (assets: ReadonlyArray<BynderImage>) => void;
      portal?: Readonly<{ url?: string; editable?: boolean }>;
      mode?: BynderMode;
      assetTypes?: ReadonlyArray<"image" | "video" | "document" | "audio">;
    }>
  ) => void;
}>;
