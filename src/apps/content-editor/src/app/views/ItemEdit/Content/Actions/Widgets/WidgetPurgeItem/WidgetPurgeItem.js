import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Button } from "@zesty-io/core/Button";

import { notify } from "shell/store/notifications";

export const WidgetPurgeItem = React.memo(function WidgetPurgeItem(props) {
  const [loading, setLoading] = useState(false);

  return (
    <Card id="WidgetDeleteItem" className="pageDetailWidget">
      <CardHeader>
        <i className="fas fa-sync" aria-hidden="true" />
        &nbsp;CDN
      </CardHeader>
      <CardContent className="setting-field">
        <p>
          Force the CDN to refresh the cache for this item. CDN caching can take
          from a few seconds to minutes to occur as this re-caches the item
          across the entire global network.
        </p>
      </CardContent>
      <CardFooter>
        {loading ? (
          <Button disabled={loading}>
            <i className="fa fa-spinner" aria-hidden="true" />
            Refreshing Cached Item&hellip;
          </Button>
        ) : (
          <Button
            id="RefreshCache"
            onClick={() => {
              setLoading(true);

              return request(
                `${CONFIG.service.sites}/content/sets/${props.modelZUID}/items/${props.itemZUID}/purge`
              )
                .then(() => {
                  setLoading(false);
                  props.dispatch(
                    notify({
                      message: "The item has been purged from the CDN cache",
                      kind: "save"
                    })
                  );
                })
                .catch(() => {
                  setLoading(false);
                  props.dispatch(
                    notify({
                      message:
                        "There was an issue trying to purge the CDN cache",
                      kind: "warn"
                    })
                  );
                });
            }}
          >
            <i className="fas fa-sync" aria-hidden="true" />
            Refresh Cached Item
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});
