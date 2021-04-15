import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug } from "@fortawesome/free-solid-svg-icons";

import GoogleAuthOverlayDomain from "./GoogleAuthOverlayDomain";

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

        <GoogleAuthOverlayDomain
          gaLegacyAuth={this.props.gaLegacyAuth}
          authTitles={this.state.titles.legacyAuthentication}
          authDescriptions={this.state.titles.legacyAuthentication}
          authNotTitles={this.state.titles.notAuthenticated}
          authNotDescriptions={this.state.descriptions.notAuthenticated}
          authTitlesNoDomain={this.state.titles.noDomain}
          authDescriptionsNoDomain={this.state.descriptions.noDomain}
          instanceZUID={this.props.instance.ZUID}
          userID={this.props.user.ID}
          instanceID={this.props.ID}
        />

        <p className={styles.generalDescription}>
          {this.state.generalDescription}
        </p>
      </div>
    );
  }
}
