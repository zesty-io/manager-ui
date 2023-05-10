import { useState, useMemo } from "react";
import { isEmpty } from "lodash";

import { ContentModel } from "../services/types";
import { useGetContentModelsQuery } from "../services/instance";
import { useGetUsersQuery } from "../services/accounts";

const templatesetKeywords = [
  "single page model",
  "single page models",
  "singlepage model",
  "singlepage models",
];
const pagesetKeywords = [
  "multi page model",
  "multi page models",
  "multipage model",
  "multipage models",
];
const datasetKeywords = [
  "headless data",
  "headless data models",
  "headless data model",
];

interface UsersList {
  [key: string]: string;
}

/**
 * This hook is used to easily filter content models via a keyword that will
 * match the following:
 * - Model title
 * - Model ZUID
 * - Model type
 * - User ZUID
 * - User full name
 */
type UseSearchModelsByKeyword = [ContentModel[], (searchTerm: string) => void];
export const useSearchModelsByKeyword: () => UseSearchModelsByKeyword = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: models } = useGetContentModelsQuery();
  const { data: users } = useGetUsersQuery();

  const allUsers: UsersList = useMemo(() => {
    let _users: UsersList = {};

    if (!isEmpty(users)) {
      users.forEach((user) => {
        const key = `${user.firstName} ${user.lastName}`.toLowerCase();

        _users = {
          ..._users,
          [key]: user.ZUID,
        };
      });
    }

    return _users;
  }, [users]);

  const filteredModels: ContentModel[] = useMemo(() => {
    let matchedUserZUID = "";
    let modelDatatype = "";
    const term = searchTerm?.toLowerCase();

    // Check if the user's keyword matches a user's full name
    if (allUsers[term]) {
      matchedUserZUID = allUsers[term];
    }

    // Check if the user's keyword is a datatype
    if (templatesetKeywords.includes(term)) {
      modelDatatype = "templateset";
    }

    if (pagesetKeywords.includes(term)) {
      modelDatatype = "pageset";
    }

    if (datasetKeywords.includes(term)) {
      modelDatatype = "dataset";
    }

    // Filter models
    if (!isEmpty(models)) {
      /**
       * Allow users to match models via the ff:
       * - Model title
       * - Model ZUID
       * - Model type
       * - User ZUID
       * - User full name
       */
      return models.filter(
        (model) =>
          model.label?.toLowerCase().includes(term) ||
          model.ZUID === term ||
          model.type === modelDatatype ||
          model.createdByUserZUID === term ||
          model.createdByUserZUID === matchedUserZUID
      );
    }

    return [];
  }, [models, searchTerm]);

  return [filteredModels, setSearchTerm];
};
