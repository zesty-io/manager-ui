import { useState, useMemo } from "react";
import { useHistory } from "react-router";
import { SchemaRounded, InsightsRounded } from "@mui/icons-material";

import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { CreateModelDialogue } from "../CreateModelDialogue";
import { ModelList } from "./ModelList";

export const Sidebar = () => {
  const { data: models, isLoading } = useGetContentModelsQuery();
  const history = useHistory();
  const [params, setParams] = useParams();
  const [search, setSearch] = useState(params.get("term") || "");
  const [isCreateModelDialogueOpen, setIsCreateModelDialogueOpen] =
    useState(false);

  const subMenu: SubMenu[] = [
    {
      name: "All Models",
      path: "/schema",
      icon: SchemaRounded,
    },
    // TODO: Maybe remove?
    {
      name: "Insights",
      path: "/schema/insights",
      icon: InsightsRounded,
    },
  ];

  return (
    <>
      <AppSideBar
        data-cy="schema-nav"
        headerTitle="Schema"
        mode="dark"
        subMenus={subMenu}
        searchPlaceholder="Search Models"
        titleButtonTooltip="Create Model"
        hideSubMenuOnSearch={false}
        onAddClick={() => setIsCreateModelDialogueOpen(true)}
        onFilterEnter={(keyword) => {
          if (!!keyword) {
            history.push("/schema/search?term=" + keyword);
          }
        }}
      >
        <ModelList
          title="single page"
          type="templateset"
          models={models?.filter((model) => model.type === "templateset") || []}
        />
        <ModelList
          title="multi page"
          type="pageset"
          models={models?.filter((model) => model.type === "pageset") || []}
        />
        <ModelList
          title="dataset"
          type="dataset"
          models={models?.filter((model) => model.type === "dataset") || []}
        />
      </AppSideBar>
      {isCreateModelDialogueOpen && (
        <CreateModelDialogue
          onClose={() => setIsCreateModelDialogueOpen(false)}
        />
      )}
    </>
  );
};
