import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { notify } from "../../store/notifications";
import { enqueueAction } from "../../../engine/queue";
import { getRefRegistry } from "../../../engine/refRegistry";

// Applies a SET_VALUE only when its ref has a handle on this page. Otherwise
// the action queue logs the failure and moves on, so the caller would record
// the suggestion as applied when nothing changed. A handle can also refuse a
// value it would not apply. Returns whether it applied.
export const useApplySetValue = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return useCallback(
    (refKey: string, value: string) => {
      const handle = getRefRegistry()[refKey]?.handle;
      if (typeof handle?.setValue !== "function") {
        dispatch(
          notify({
            kind: "warn",
            message: t("shell.aiApplyTargetMissing", { refKey }),
          })
        );
        return false;
      }
      if (handle.accepts?.(value) === false) {
        dispatch(
          notify({ kind: "warn", message: t("shell.aiApplyNotPageCode") })
        );
        return false;
      }

      enqueueAction({ type: "SET_VALUE", payload: { refKey, value } });
      return true;
    },
    [dispatch, t]
  );
};
