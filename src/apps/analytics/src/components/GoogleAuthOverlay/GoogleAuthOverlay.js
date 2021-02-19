import React from "react";
import { faGlobe, faKey, faPlug } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./GoogleAuthOverlay.less";
export class GoogleAuthOverlay extends React.Component {
  state = {
    titles: {
      noDomain: "Please Setup a Domain before Authenticating",
      notAuthenticated: "Please Authenticate Google Analytics",
      legacyAuthentication: "Google needs to be Re-authenticated"
    },
    descriptions: {
      noDomain:
        "A domain can be set in Zesty.io accounts. Open up your instance settings, and set a domain. Once a domain is set, an authentication button will appear here.",
      notAuthenticated:
        "Someone in your organization with Google Analytics access needs to authenticate this Zesty.io instance. Before authenticating, the domain associated with this instance needs to be registed in Google Analytics.",
      legacyAuthentication:
        "Traffic is being tracked, but your Google Authentication is from Legacy Zesty.io and needs to be re-authenticated to access new metrics. Someone in your organization with Google Analytics access needs to do this."
    },
    generalDescription:
      "Authenticating Google Analytics will automate GA tags in your Web Engine renders pages. If you use Zesty.io purely headlessly, Google Analytics will on provide value on rendered web views."
  };

  createAnalyticsPopup = evt => {
    var address = encodeURI(
      CONFIG.SERVICE_GOOGLE_ANALYTICS_AUTH +
        "?user_id=" +
        this.props.user.ID +
        "&account_id=" +
        this.props.instance.ID +
        "&domain=" +
        this.props.instance.domains[0].domain
    );
    console.log(address);

    var win = window.open(
      address,
      "analytics",
      "width=700,height=450,left=" +
        (evt.target.offsetLeft + 400) +
        ",top=" +
        evt.target.offsetTop
    );
    // var timer = setInterval(function() {
    //   if (win.closed) {
    //     clearInterval(timer);
    //     _ajax.get("/ajax/analytics_store_id.ajax.php", {}, function(response) {
    //       window.location.reload();
    //     });
    //   }
    // }, 1000);
  };

  render() {
    return (
      <div className={`${styles.googleAuthOverlay}`}>
        <div className={styles.googleAnaltyicsIntegration}>
          <img
            alt="Google Analytics Logo"
            className={`${styles.googleAnalyticsLogo}`}
            src="https://developers.google.com/analytics/images/terms/logo_lockup_analytics_icon_vertical_white_2x.png"
          />
          <p>
            <FontAwesomeIcon icon={faPlug} />{" "}
            <strong>Zesty.io WebEngine™</strong> Integration
          </p>
        </div>

        {this.props.domainSet ? (
          <React.Fragment>
            {this.props.gaLegacyAuth ? (
              <React.Fragment>
                <h2>{this.state.titles.legacyAuthentication}</h2>
                <p>{this.state.descriptions.legacyAuthentication}</p>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h2>{this.state.titles.notAuthenticated}</h2>
                <p>{this.state.descriptions.notAuthenticated}</p>
              </React.Fragment>
            )}
            <div className={styles.buttonHolder}>
              <Button kind="save" onClick={this.createAnalyticsPopup}>
                <FontAwesomeIcon icon={faKey} />
                Click here to Authenticate With Google
              </Button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h2>{this.state.titles.noDomain}</h2>
            <p>{this.state.descriptions.noDomain}</p>
            <div className={styles.buttonHolder}>
              <Button
                kind="secondary"
                onClick={() => {
                  window.location = `${CONFIG.URL_ACCOUNTS}/instances/${this.props.instance.ZUID}/launch`;
                }}
              >
                <FontAwesomeIcon icon={faGlobe} />
                Click here to Setup Your Domain
              </Button>
            </div>
          </React.Fragment>
        )}

        <p className={styles.generalDescription}>
          {this.state.generalDescription}
        </p>
      </div>
    );
  }
}
