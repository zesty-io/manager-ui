import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import Box from "@mui/material/Box";

import { WithLoader } from "shell/components/legacy/WithLoader";
import { LeadExporter } from "../../components/LeadExporter";
import { LeadsTable } from "../../components/LeadsTable";
import { GetStarted } from "../GetStarted";

import { fetchLeads } from "../../../store/leads";
import { LoadingQuote } from "../../../../../../shell/components/LoadingQuote";

export default connect((state) => state)(function Leads(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(props.dispatch(fetchLeads())).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingQuote />;
  }

  if (!props.leads.length) {
    return <GetStarted />;
  }

  return (
    <Box
      component="section"
      data-cy="leadsView"
      sx={{ height: "calc(100vh - 54px)", overflowY: "auto" }}
    >
      <LeadExporter />
      <main>
        <Route component={LeadsTable} />
      </main>
    </Box>
  );
});
