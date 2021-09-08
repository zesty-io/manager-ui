import { Fragment, useState, useEffect } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./Wizard.less";
export function Wizard(props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (props.defaultStep) {
      setStep(props.defaultStep);
    }
  }, [props.defaultStep]);

  function next(onNext) {
    if (step < props.children.length) {
      const newStep = step + 1;
      if (onNext) onNext();
      setStep(newStep);
    }
  }

  function prev() {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
    }
  }

  function showBack(child) {
    if (child !== undefined) {
      return child;
    } else {
      return step > 0;
    }
  }

  /**
   * The wizards job is take N steps and determine which step to display. It
   * does so by tracking internal `step` state and then comparing it with the list
   * of children to determine which child node/component to render.
   */
  return (
    <div className={styles.WizardLayout}>
      <div className={styles.WizardAligner}>
        {props.children.map((child, index) => {
          return (
            <Fragment key={index}>
              {step === index && (
                <div
                  className={styles.WizardStepWrap}
                  style={child.props.style}
                >
                  {child}

                  {/* Do not sure footer buttons on last step */}
                  {step < props.children.length - 1 && (
                    <div
                      className={cx(styles.WizardFooter, {
                        [styles.CenteredFooter]: !showBack(
                          child.props.showBack
                        ),
                      })}
                    >
                      {showBack(child.props.showBack) && (
                        <Button
                          type="cancel"
                          onClick={prev}
                          className={styles.Button}
                        >
                          <FontAwesomeIcon icon={faChevronLeft} /> Back
                        </Button>
                      )}
                      {step < props.children.length && (
                        <Button
                          className={cx(styles.Button, styles.NextButton)}
                          kind="primary"
                          onClick={() => next(child.props.onNext)}
                          disabled={child.props.locked}
                        >
                          <FontAwesomeIcon
                            className={styles.ButtonIcon}
                            icon={faChevronRight}
                          />
                          {child.props.labelButtonNext
                            ? child.props.labelButtonNext
                            : "Continue"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
