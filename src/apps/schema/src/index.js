import { store, injectReducer } from "shell/store";

import { navSchema } from "./store/navSchema";
import { parents } from "./store/parents";

import { SchemaBuilder } from "./app";

injectReducer(store, "navSchema", navSchema);
injectReducer(store, "parents", parents);

export default SchemaBuilder;
