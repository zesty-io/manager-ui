import { store, injectReducer } from "shell/store";
import { leads } from "./store/leads";
import { filter } from "./store/filter";
import Leads from "./app/views/Leads";

injectReducer(store, "leads", leads);
injectReducer(store, "filter", filter);

export default Leads;
