"use strict";

// Local ESLint plugin for this repo's own custom rules — grouped by
// category into sibling folders (zestyI18n/ today; more may join later).
// Not published — referenced directly by path from eslint.config.js.
module.exports = {
  rules: {
    "key-format": require("./zestyI18n/key-format"),
  },
};
