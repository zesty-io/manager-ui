import React, { useState } from "react";
import { connect } from "react-redux";

import GlobalAccountMenu from "shell/components/global-account-menu";

import css from "./GlobalAccount.less";
// export default function GlobalAccount() {
//   const [openMenu, setOpenMenu] = useState(false);
//   const [token, setToken] = useState(false);

//   return (
//     <div
//       className={css.GlobalAccount}
//       onMouseEnter={() => {
//         if (token) {
//           clearTimeout(token);
//         }
//         setOpenMenu(true);
//       }}
//       onMouseLeave={() => {
//         setToken(setTimeout(() => setOpenMenu(false), 500));
//       }}
//     >
//       {/* <FontAwesomeIcon icon={faGlobe} /> */}
//       <img
//         alt={`${props.user.firstName} ${props.user.lastName} Avatar`}
//         src={`https://www.gravatar.com/avatar/${props.user.emailHash}?d=mm&s=60`}
//         width="60px"
//       />
//       <GlobalAccountMenu display={openMenu} />
//     </div>
//   );
// }

export default connect(state => {
  return {
    instance: state.instance,
    instances: state.instances,
    user: state.user
  };
})(function GlobalAccount(props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [token, setToken] = useState(false);

  return (
    <div
      className={css.GlobalAccount}
      onMouseEnter={() => {
        if (token) {
          clearTimeout(token);
        }
        setOpenMenu(true);
      }}
      onMouseLeave={() => {
        setToken(setTimeout(() => setOpenMenu(false), 500));
      }}
    >
      <img
        alt={`${props.user.firstName} ${props.user.lastName} Avatar`}
        src={`https://www.gravatar.com/avatar/${props.user.emailHash}?d=mm&s=60`}
        width="60px"
      />
      <GlobalAccountMenu display={openMenu} />
    </div>
  );
});
