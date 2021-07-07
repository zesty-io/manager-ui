import { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { store, injectReducer } from "shell/store";
import { fetchModels } from "shell/store/models";

import { navSchema } from "./store/navSchema";
import { parents } from "./store/parents";

import { fetchSettings } from "../../settings/src/store/settings";

import { SchemaBuilder } from "./app";

injectReducer(store, "navSchema", navSchema);
injectReducer(store, "parents", parents);

export default connect((state) => {
  return {
    settings: state.settings,
    models: state.models,
  };
})(function SchemaApp(props) {
  useEffect(() => {
    store.dispatch(fetchModels());
    // used for instant JSON API
    store.dispatch(fetchSettings());
  }, []);

  return (
    <WithLoader
      condition={
        props.settings.instance.length && Object.keys(props.models).length
      }
      message="Starting Schema"
    >
      <SchemaBuilder />
    </WithLoader>
  );
});
