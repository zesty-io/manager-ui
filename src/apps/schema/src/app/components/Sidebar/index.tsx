import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { SvgIconComponent } from "@mui/icons-material";
import { Box } from "@mui/material";
import { DatabaseSearch } from "@zesty-io/material";

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

  useEffect(() => {
    setSearch(params.get("term") || "");
  }, [params.get("term")]);

  const subMenu: SubMenu[] = [
    {
      name: "All Models",
      path: "/schema",
      icon: DatabaseSearch as SvgIconComponent,
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
        filterKeyword={search}
        onAddClick={() => setIsCreateModelDialogueOpen(true)}
        onFilterEnter={(keyword) => {
          if (!!keyword) {
            history.push("/schema/search?term=" + keyword);
          }
        }}
      >
        {!isLoading && (
          <>
            <ModelList
              title="single page"
              type="templateset"
              models={
                models?.filter((model) => model.type === "templateset") || []
              }
            />
            <Box pt={1.5}>
              <ModelList
                title="multi page"
                type="pageset"
                models={
                  models?.filter((model) => model.type === "pageset") || []
                }
              />
            </Box>
            <Box pt={1.5}>
              <ModelList
                title="dataset"
                type="dataset"
                models={
                  models?.filter((model) => model.type === "dataset") || []
                }
              />
            </Box>
          </>
        )}
      </AppSideBar>
      {isCreateModelDialogueOpen && (
        <CreateModelDialogue
          onClose={() => setIsCreateModelDialogueOpen(false)}
        />
      )}
    </>
  );
};
