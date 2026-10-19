import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { notify } from "../../store/notifications";
import { enqueueAction } from "../../../engine/queue";
import { getRefRegistry } from "../../../engine/refRegistry";

// Applies a SET_VALUE only when its ref has a handle on this page. Otherwise
// the action queue logs the failure and moves on, so the caller would record
// the suggestion as applied when nothing changed. Returns whether it applied.
export const useApplySetValue = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return useCallback(
    (refKey: string, value: string) => {
      if (typeof getRefRegistry()[refKey]?.handle?.setValue !== "function") {
        dispatch(
          notify({
            kind: "warn",
            message: t("shell.aiApplyTargetMissing", { refKey }),
          })
        );
        return false;
      }

      enqueueAction({ type: "SET_VALUE", payload: { refKey, value } });
      return true;
    },
    [dispatch, t]
  );
};
