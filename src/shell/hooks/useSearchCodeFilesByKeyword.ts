import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { WebView, Script, Stylesheet } from "../services/types";
import {
  useGetWebViewsQuery,
  useGetStylesheetsQuery,
  useGetScriptsQuery,
} from "../services/instance";

/**
 * This hook is used to easily filter code files via a keyword that matches the ff:
 * - File name
 * - File ZUID
 */
export type File = Pick<
  WebView | Script | Stylesheet,
  keyof (WebView | Script | Stylesheet)
>;
type UseSearchCodeFilesByKeywords = [File[], (searchTerm: string) => void];
export const useSearchCodeFilesByKeywords: () => UseSearchCodeFilesByKeywords =
  () => {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: webViews } = useGetWebViewsQuery({ status: "dev" });
    const { data: stylesheets } = useGetStylesheetsQuery();
    const { data: scripts } = useGetScriptsQuery();

    // Create one array with all the files
    const allFiles: File[] = useMemo(() => {
      let files: File[] = [...(stylesheets ?? []), ...(scripts ?? [])];

      if (!isEmpty(webViews)) {
        const views = webViews.map(
          ({ contentModelType, contentModelZUID, customZNode, ...rest }) => {
            return rest;
          }
        );

        files = [...files, ...views];
      }

      return files;
    }, [webViews, stylesheets, scripts]);

    // Filter files based on file name
    const filteredFiles: File[] = useMemo(() => {
      const term = searchTerm?.toLowerCase();

      /**
       * Matches the ff:
       * - File name
       * - File ZUID
       */
      return allFiles?.filter(
        (file) =>
          file.fileName?.toLowerCase().includes(term) || file.ZUID === term
      );
    }, [allFiles, searchTerm]);

    return [filteredFiles, setSearchTerm];
  };
