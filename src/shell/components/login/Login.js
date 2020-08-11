import React, { useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faCheckCircle,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Input } from "@zesty-io/core/Input";
import { Notice } from "@zesty-io/core/Notice";
import { Url } from "@zesty-io/core/Url";

import { login, verifyTwoFactor, pollTwoFactor } from "shell/store/auth";
import { notify } from "shell/store/notifications";

import styles from "./Login.less";
export default connect(state => {
  return {
    auth: state.auth,
    user: state.user
  };
})(
  React.memo(function Login(props) {
    const [loading, setLoading] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = evt => {
      evt.preventDefault();
      setLoading(true);

      props
        .dispatch(login(evt.target.email.value, evt.target.password.value))
        .then(res => {
          if (res.status === 202) {
            setTwoFactor(true);

            // Start polling for one-touch acceptance
            props.dispatch(pollTwoFactor());
          } else if (res.status !== 200) {
            setError(res.message);
            setLoading(false);
          }
        })
        .catch(err => {
          setLoading(false);
          setError("There was a problem signing you in");
        });
    };

    const handleTwoFactor = evt => {
      evt.preventDefault();

      props
        .dispatch(verifyTwoFactor(evt.target.token.value))
        .then(res => {
          setError(res.message);
        })
        .catch(err => {
          console.log(err);
        });
    };

    return (
      <Modal
        className={styles.Login}
        open={!props.auth.valid || props.auth.checking}
      >
        <ModalContent>
          <div>
            <img src="/zesty-z-logo.png" alt="Zesty.io Logo" width="40px" />
          </div>

          {twoFactor ? (
            <form onSubmit={handleTwoFactor}>
              <h1 className={styles.display}>
                Two Factor Authentication Token
              </h1>

              <p className={cx(styles.bodyText, styles.message)}>
                Your account has{" "}
                <Url href="https://authy.com/what-is-2fa/" target="_blank">
                  Authy Two Factor Authentication
                </Url>{" "}
                enabled which requires entering a one time token in order to
                complete your login.
              </p>

              <label>
                <span>7 Digit Authy Token</span>
                <Input name="token" type="text" autoComplete="off" />
              </label>

              <Button>
                <FontAwesomeIcon icon={faCheckCircle} />
                Confirm Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <h1 className={styles.display}>Login to Continue</h1>

              <p className={cx(styles.bodyText, styles.message)}>
                Your session has expired and you need to login to access this
                instance.
              </p>

              <FieldTypeText
                type="email"
                name="email"
                label="Email"
                placeholder="e.g. hello@zesty.io"
              />
              <FieldTypeText type="password" name="password" label="Password" />
              <Button>
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} />
                ) : (
                  <FontAwesomeIcon icon={faSignInAlt} />
                )}
                Resume Session
              </Button>
            </form>
          )}

          {error && <Notice className={styles.error}>{error}</Notice>}
        </ModalContent>
      </Modal>
    );
  })
);
