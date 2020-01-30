import React from "react";
import { connect } from "react-redux";

export default connect()(function Welcome() {
  return (
    <section>
      <h1 style={{ textAlign: "center", fontSize: "38px", marginTop: "100px" }}>
        Welcome to Zesty.io
      </h1>
    </section>
  );
});
