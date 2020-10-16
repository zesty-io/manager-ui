import { store, injectReducer } from "shell/store";
import { redirects } from "./store/redirects";
import { redirectsFilter } from "./store/redirectsFilter";
import { imports } from "./store/imports";
import SeoApp from "./app";

injectReducer(store, "redirects", redirects);
injectReducer(store, "redirectsFilter", redirectsFilter);
injectReducer(store, "imports", imports);

export default SeoApp;
