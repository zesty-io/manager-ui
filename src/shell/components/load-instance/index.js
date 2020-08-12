import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchInstance, fetchDomains } from "shell/store/instance";
import { fetchUser } from "shell/store/user";
import { fetchUserRole } from "shell/store/userRole";

export default connect(state => {
  return {
    instance: state.instance,
    user: state.user
  };
})(
  React.memo(function LoadInstance(props) {
    useEffect(() => {
      props.dispatch(fetchUser(props.user.ZUID));
      props.dispatch(fetchInstance()).then(res => {
        document.title = `Zesty Manager - ${res.data.name}`;
      });
      props.dispatch(fetchUserRole());
      props.dispatch(fetchDomains());

      // Promise.all([instance, products]).then(res => {
      //   // console.log("loaded instance");
      //   // Some legacy code refers to this global which is an observable
      //   // FIXME: this needs to get refactored out
      //   // window.zesty = riot.observable(store.getState());
      //   // store.subscribe(() => {
      //   //   window.zesty = riot.observable(store.getState());
      //   // });
      // });
    }, []);

    return (
      <WithLoader
        condition={props.instance.ID && props.instance.domains && props.user.ID}
        message="Loading Instance"
        width="100vw"
        height="100vh"
      >
        {props.children}
      </WithLoader>
    );
  })
);
