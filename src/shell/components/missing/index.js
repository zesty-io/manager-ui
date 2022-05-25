import { connect } from "react-redux";

import Link from "@mui/material/Link";

export default connect()(function Welcome() {
  return (
    <section>
      <h1 style={{ textAlign: "center", fontSize: "38px", marginTop: "100px" }}>
        This URL doesn't seem to have have anything here.
      </h1>
      <h2 style={{ textAlign: "center", fontSize: "26px", marginTop: "16px" }}>
        If it seems like something is missing please let us know at{" "}
        <Link title="Support" href="mailto:support@zesty.io">
          support@zesty.io
        </Link>
      </h2>
    </section>
  );
});
