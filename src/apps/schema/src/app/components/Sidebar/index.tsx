import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { SvgIconComponent } from "@mui/icons-material";
import { Box } from "@mui/material";
import { DatabaseSearch } from "@zesty-io/material";
import { useTranslation } from "react-i18next";

import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { CreateModelDialogue } from "../CreateModelDialogue";
import { ModelList } from "./ModelList";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";

export const Sidebar = () => {
  const { t } = useTranslation();
  const { data: models, isLoading } = useGetContentModelsQuery();
  const history = useHistory();
  const [params, setParams] = useParams();
  const [search, setSearch] = useState(params.get("term") || "");
  const [isCreateModelDialogueOpen, setIsCreateModelDialogueOpen] =
    useState(false);
  const user = useSelector((state: AppState) => state.user);

  useEffect(() => {
    setSearch(params.get("term") || "");
  }, [params.get("term")]);

  const subMenu: SubMenu[] = [
    {
      name: t("schema.allModels"),
      path: "/schema",
      icon: DatabaseSearch as SvgIconComponent,
    },
  ];

  return (
    <>
      <AppSideBar
        data-cy="schema-nav"
        headerTitle={t("schema.headerTitle")}
        mode="dark"
        subMenus={subMenu}
        searchPlaceholder={t("schema.searchModelsPlaceholder")}
        titleButtonTooltip={t("schema.createModel")}
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
              title={t("schema.modelTypeSinglePage")}
              type="templateset"
              models={
                models?.filter((model) => model.type === "templateset") || []
              }
            />
            <Box pt={1.5}>
              <ModelList
                title={t("schema.modelTypeMultiPage")}
                type="pageset"
                models={
                  models?.filter((model) => model.type === "pageset") || []
                }
              />
            </Box>
            <Box pt={1.5}>
              <ModelList
                title={t("schema.modelTypeDataset")}
                type="dataset"
                models={
                  models?.filter((model) => model.type === "dataset") || []
                }
              />
            </Box>
            <Box pt={1.5}>
              <ModelList
                title={t("shell.navBlocks")}
                type="block"
                models={models?.filter((model) => model.type === "block") || []}
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
