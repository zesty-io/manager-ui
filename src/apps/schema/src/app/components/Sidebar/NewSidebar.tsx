import { useState } from "react";
import { useHistory } from "react-router";

import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { CreateModelDialogue } from "../CreateModelDialogue";

export const Sidebar = () => {
  const { data: models, isLoading } = useGetContentModelsQuery();
  const history = useHistory();
  const [params, setParams] = useParams();
  const [search, setSearch] = useState(params.get("term") || "");
  const [isCreateModelDialogueOpen, setIsCreateModelDialogueOpen] =
    useState(false);

  return (
    <>
      <AppSideBar
        data-cy="schema-nav"
        headerTitle="Schema"
        mode="dark"
        searchPlaceholder="Search Models"
        titleButtonTooltip="Create Model"
        onAddClick={() => setIsCreateModelDialogueOpen(true)}
        onFilterEnter={(keyword) => {
          if (!!keyword) {
            history.push("/schema/search?term=" + keyword);
          }
        }}
      />
      {isCreateModelDialogueOpen && (
        <CreateModelDialogue
          onClose={() => setIsCreateModelDialogueOpen(false)}
        />
      )}
    </>
  );
};
