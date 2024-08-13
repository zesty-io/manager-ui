import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { debounce } from "lodash";
import { CheckCircleRounded, CancelRounded } from "@mui/icons-material";

import { withCursorPosition } from "../../../../../../../../shell/components/withCursorPosition";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { searchItems } from "../../../../../../../../shell/store/content";
import { notify } from "../../../../../../../../shell/store/notifications";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItemWithDirtyAndPublishing } from "../../../../../../../../shell/services/types";
import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";

const TextFieldWithCursorPosition = withCursorPosition(TextField);

type ItemRouteProps = {
  onChange: (value: string, name: string) => void;
  error: Error;
  onUpdateErrors: (name: string, error: Error) => void;
};
export const ItemRoute = ({
  onChange,
  error,
  onUpdateErrors,
}: ItemRouteProps) => {
  const dispatch = useDispatch();
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const domain = useDomain();
  const items = useSelector((state: AppState) => state.content);
  const item = items[itemZUID];
  const [pathPart, setPathPart] = useState(item?.web?.pathPart);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnique, setIsUnique] = useState(true);

  const parent = items[item?.web?.parentZUID];

  const validate = useCallback(
    debounce((path) => {
      if (!path) {
        setIsUnique(false);
        return;
      }

      const fullPath = parent ? `${parent.web?.path}${path}/` : `/${path}/`;

      setIsLoading(true);

      return (
        dispatch(searchItems(fullPath))
          // @ts-expect-error untyped
          .then((res) => {
            if (res?.data) {
              if (Array.isArray(res.data) && res.data.length) {
                // check list of partial matches for exact path match
                const matches = res.data.filter(
                  (_item: ContentItemWithDirtyAndPublishing) => {
                    /**
                     * Exclude currently viewed item zuid, as it's currently saved path would match.
                     * Check if other results have a matching path, if so then it is already taken and
                     * can not be used.
                     * Result paths come with leading and trailing slashes
                     */
                    return (
                      _item.meta.ZUID !== item?.meta?.ZUID &&
                      _item.web.path === fullPath
                    );
                  }
                );

                setIsUnique(!matches.length);
                onUpdateErrors("pathPart", {
                  CUSTOM_ERROR: !!matches.length
                    ? "This URL Path Part is already taken. Please enter a new different URL Path part."
                    : "",
                });
              } else {
                setIsUnique(true);
                onUpdateErrors("pathPart", {
                  CUSTOM_ERROR: "",
                });
              }
            } else {
              dispatch(
                notify({
                  kind: "warn",
                  message: `API failed to return data ${res.status}`,
                })
              );
            }
          })
          .finally(() => setIsLoading(false))
      );
    }, 1000),
    [parent]
  );

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    // All URLs are lowercased
    // Replace ampersand characters with 'and'
    // Only allow alphanumeric characters
    const path = evt.target.value
      .trim()
      .toLowerCase()
      .replace(/\&/g, "and")
      .replace(/[^a-zA-Z0-9]/g, "-");

    validate(path);
    setPathPart(path);

    onChange(path, "pathPart");
  };

  // Revalidate when parent path changes
  useEffect(() => {
    validate(pathPart);
  }, [parent?.web]);

  return (
    <FieldShell
      settings={{
        label: "URL Path Part",
        required: true,
      }}
      customTooltip="Also known as a URL slug, it is the last part of the URL address that serves as a unique identifier of the page. They must be unique within your instance, lowercased, and cannot contain non alphanumeric characters. This helps ensure you create SEO friendly structured and crawlabale URLs."
      withInteractiveTooltip={false}
      errors={error}
    >
      <TextFieldWithCursorPosition
        type="text"
        name="pathPart"
        value={pathPart}
        onChange={handleInputChange}
        variant="outlined"
        color="primary"
        fullWidth
        InputProps={{
          startAdornment: (
            <Adornment isLoading={isLoading} isUnique={isUnique} />
          ),
        }}
        helperText={
          !!pathPart &&
          isUnique && (
            <Typography variant="body2" color="info.dark">
              {domain}
              {parent ? parent.web?.path + pathPart : `/${pathPart}`}
            </Typography>
          )
        }
        error={hasErrors(error)}
      />
    </FieldShell>
  );
};

type AdornmentProps = {
  isLoading: boolean;
  isUnique: boolean;
};
const Adornment = ({ isLoading, isUnique }: AdornmentProps) => {
  if (isLoading) {
    return (
      <InputAdornment
        position="start"
        sx={{ minWidth: 32, justifyContent: "center" }}
      >
        <CircularProgress size={20} />
      </InputAdornment>
    );
  }

  return (
    <InputAdornment position="start">
      {isUnique ? (
        <CheckCircleRounded color="success" />
      ) : (
        <CancelRounded color="error" />
      )}
    </InputAdornment>
  );
};
