import { memo, useState } from "react";

import SyncIcon from "@mui/icons-material/Sync";
import LoadingButton from "@mui/lab/LoadingButton";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

export const WidgetPurgeItem = memo(function WidgetPurgeItem(props) {
  const [loading, setLoading] = useState(false);

  return (
    <Card id="WidgetDeleteItem" className="pageDetailWidget" sx={{ m: 2 }}>
      <CardHeader
        avatar={<SyncIcon fontSize="small" />}
        title="CDN"
      ></CardHeader>
      <CardContent className="setting-field">
        <p>
          Force the CDN to refresh the cache for this item. CDN caching can take
          from a few seconds to minutes to occur as this re-caches the item
          across the entire global network.
        </p>
      </CardContent>
      <CardActions>
        <LoadingButton
          variant="contained"
          id="RefreshCache"
          onClick={() => {
            setLoading(true);

            return request(
              `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/fastlyPurge?zuid=${props.itemZUID}&instance=${props.instanceZUID}`
            )
              .then(() => {
                setLoading(false);
                props.dispatch(
                  notify({
                    message: "The item has been purged from the CDN cache",
                    kind: "save",
                  })
                );
              })
              .catch(() => {
                setLoading(false);
                props.dispatch(
                  notify({
                    message: "There was an issue trying to purge the CDN cache",
                    kind: "warn",
                  })
                );
              });
          }}
          loading={loading}
          loadingPosition="start"
          startIcon={<SyncIcon />}
        >
          {loading ? "Refreshing Cached Item" : "Refresh Cached Item"}
        </LoadingButton>
      </CardActions>
    </Card>
  );
});
