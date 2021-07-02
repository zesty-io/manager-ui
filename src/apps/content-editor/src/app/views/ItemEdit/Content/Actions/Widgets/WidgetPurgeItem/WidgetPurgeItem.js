import { memo, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import SharedWidgetStyles from "../SharedWidget.less";

export const WidgetPurgeItem = memo(function WidgetPurgeItem(props) {
  const [loading, setLoading] = useState(false);

  return (
    <Card id="WidgetDeleteItem" className="pageDetailWidget">
      <CardHeader>
        <FontAwesomeIcon icon={faSync} />
        &nbsp;CDN
      </CardHeader>
      <CardContent className="setting-field">
        <p>
          Force the CDN to refresh the cache for this item. CDN caching can take
          from a few seconds to minutes to occur as this re-caches the item
          across the entire global network.
        </p>
      </CardContent>
      <CardFooter className={SharedWidgetStyles.FooterSpacing}>
        {loading ? (
          <Button className={SharedWidgetStyles.Button} disabled={loading}>
            <FontAwesomeIcon icon={faSpinner} spin />
            Refreshing Cached Item&hellip;
          </Button>
        ) : (
          <Button
            className={SharedWidgetStyles.Button}
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
                      message:
                        "There was an issue trying to purge the CDN cache",
                      kind: "warn",
                    })
                  );
                });
            }}
          >
            <FontAwesomeIcon icon={faSync} />
            Refresh Cached Item
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});
