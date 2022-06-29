import { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { MD5 } from "utility/md5";

import styles from "./styles.less";
class Log extends Component {
  getGravatar(email, size) {
    var size = size || 80;
    return "https://www.gravatar.com/avatar/" + MD5(email) + ".jpg?s=" + size;
  }

  getMoment(date) {
    return moment(date).format("hh:mm A on MMMM Do, YYYY Z");
  }

  timeFromNow(date) {
    return moment(date).fromNow();
  }

  getUserLink(name, email) {
    return (
      <a className={styles.emailLink} href={`mailto:${email}`}>
        {name}&nbsp;
        <FontAwesomeIcon icon={faEnvelope} />
      </a>
    );
  }

  render() {
    let { meta, email, firstName, happenedAt, action } = this.props.log;

    return (
      <article className={styles.auditLog}>
        <header className={styles.action}>
          <span className={styles.type + " " + styles["type" + action]} />
          <img
            src={this.getGravatar(email, 70)}
            className={styles.avatar}
            height="70"
            width="70"
          />
        </header>
        <main className={styles.content}>
          <h1>{meta.message}</h1>
          <p className={styles.meta}>
            {this.timeFromNow(happenedAt)} ago by{" "}
            {this.getUserLink(firstName, email)} at {this.getMoment(happenedAt)}
          </p>
        </main>
      </article>
    );
  }
}

export default connect((state) => state)(Log);
