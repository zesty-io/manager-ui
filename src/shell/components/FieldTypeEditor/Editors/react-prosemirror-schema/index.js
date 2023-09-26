import { Schema } from "prosemirror-model";

import nodes from "./nodes";
import marks from "./marks";

export const schema = new Schema({ nodes, marks });
