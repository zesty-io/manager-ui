import React from "react";
import { connect } from "react-redux";

import { Url } from "@zesty-io/core/Url";

export default connect()(function Welcome() {
  return (
    <section>
      <h1 style={{ textAlign: "center", fontSize: "38px", marginTop: "100px" }}>
        This URL doesn't seem to have have anything here.
      </h1>
      <h2 style={{ textAlign: "center", fontSize: "26px", marginTop: "16px" }}>
        If it seems like something is missing please let us know at{" "}
        <Url title="Support" href="mailto:support@zesty.io">
          support@zesty.io
        </Url>
      </h2>
    </section>
  );
});
