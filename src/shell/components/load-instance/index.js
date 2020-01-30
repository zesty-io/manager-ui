import React, { useEffect } from "react";
import { connect } from "react-redux";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { fetchInstance } from "shell/store/instance";
import { fetchProducts } from "shell/store/user";

// import { store } from "shell/store";

export default connect(state => {
  return {
    instance: state.instance
  };
})(function LoadInstance(props) {
  // console.log("LoadInstance", props);

  useEffect(() => {
    const instance = props.dispatch(fetchInstance());
    const products = props.dispatch(fetchProducts());

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
      condition={props.instance.ID}
      message="Loading Instance"
      width="100vw"
      height="100vh"
    >
      {props.children}
    </WithLoader>
  );
});
