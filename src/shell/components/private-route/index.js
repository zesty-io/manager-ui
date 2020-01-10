import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { verify } from "../../store/auth";

export default connect(state => {
  return {
    auth: state.auth
  };
})(function PrivateRoute(props) {
  console.log("PrivateRoute", props);

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(true); // TODO switch to false

  useEffect(() => {
    setLoading(true);
    props
      .dispatch(verify())
      .then(res => {
        setLoading(false);

        if (res.code === 200) {
          setAuth(true);
        }
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  return (
    <WithLoader condition={!loading} message="Logging into instance">
      {auth ? (
        props.children
      ) : (
        <Redirect
          to={`${CONFIG.ACCOUNTS_UI}/login?redirect=${window.location}`}
        />
      )}
    </WithLoader>
  );
});
