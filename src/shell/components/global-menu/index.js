import React, { Component } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faImage,
  faAddressCard,
  faPuzzlePiece,
  faCodeBranch,
  faChartPie,
  faChartLine,
  faCheckSquare,
  faCog
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.less";

import { subMenuLoad, subMenuTimer } from "shell/store/ui/global-sub-menu";

export default class GlobalMenu extends Component {
  constructor(props) {
    super(props);

    this.hideMenu = this.hideMenu.bind(this);
    this.showMenu = this.showMenu.bind(this);

    // this.state = {
    //   reveal: undefined
    // }
  }
  componentWillMount() {
    console.log("GlobalMenu:componentWillMount", this);
  }
  render() {
    return (
      <menu className={styles.GlobalMenu}>
        {/*this.props.products.map(product => {
          return <Link
                  className={styles.control}
                  to={`/${product}`}
                  title="Content Editor"
                  onMouseEnter={this.showMenu}

                  onClick={this.showMenu}>
                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                  <span className={styles.title}>{product}</span>
                </Link>
        })*/}

        <Link
          className={styles.control}
          to="/content"
          title="Content Editor"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faEdit} />
          <span className={styles.title}>Content</span>
        </Link>
        <Link
          className={styles.control}
          to="/media"
          title="Media Manager"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faImage} />
          <span className={styles.title}>Media</span>
        </Link>
        {/* <Link
          className={styles.control}
          to="/forms"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <i className="fa fa-envelope-o" aria-hidden="true" />
          <span className={styles.title}>Forms</span>
        </Link> */}
        <Link
          className={styles.control}
          to="/leads"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faAddressCard} />
          <span className={styles.title}>Leads</span>
        </Link>

        <Link
          className={styles.build}
          to="/schema"
          title="Schema Editor"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faPuzzlePiece} />
          <span className={styles.title}>Schema</span>
        </Link>
        <Link
          className={styles.build}
          to="/code"
          title="Code Editor"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faCodeBranch} />
          <span className={styles.title}>Code</span>
        </Link>

        <Link
          className={styles.optimize}
          to="/analytics"
          title="Analytics"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faChartPie} />
          <span className={styles.title}>Analytics</span>
        </Link>
        <Link
          className={styles.optimize}
          to="/seo"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faChartLine} />
          <span className={styles.title}>SEO</span>
        </Link>
        <Link
          className={styles.optimize}
          to="/audit-trail"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faCheckSquare} />
          <span className={styles.title}>AuditTrail</span>
        </Link>

        <Link
          className={styles.settings}
          to="/settings"
          onClick={this.hideMenu}
          onMouseEnter={this.showMenu}
        >
          <FontAwesomeIcon icon={faCog} />
          <span className={styles.title}>Settings</span>
        </Link>
      </menu>
    );
  }
  hideMenu() {
    // if (this.state.reveal) {
    //   clearTimeout(this.state.reveal)
    // }

    this.props.dispatch(subMenuLoad(""));
  }
  showMenu(evt) {
    // if (this.state.reveal) {
    //   clearTimeout(this.state.reveal)
    // }

    if (evt.target.href) {
      const currentHref = window.location.pathname;
      const hoveredHref = evt.target.href.split("/")[3];

      if (currentHref.indexOf(hoveredHref) === -1) {
        const timeout = setTimeout(() => {
          console.log("setTimeout");
          switch (hoveredHref) {
            case "content":
              this.props.dispatch(subMenuLoad("content"));
              break;
            case "media":
              this.props.dispatch(subMenuLoad("media"));
              break;
            case "code":
              this.props.dispatch(subMenuLoad("code"));
              break;
          }
        }, 500);

        this.props.dispatch(subMenuTimer(timeout));

        // const reveal = setTimeout(() => {
        //   switch(hoveredHref) {
        //     case 'content':
        //       this.props.dispatch(subMenuLoad('content'))
        //       break;
        //     case 'media':
        //       this.props.dispatch(subMenuLoad('media'))
        //       break;
        //     case 'code':
        //       this.props.dispatch(subMenuLoad('code'))
        //       break;
        //     // case 'analytics':
        //     //   this.props.dispatch(subMenuLoad('analytics'))
        //     // case 'seo':
        //     //   this.props.dispatch(subMenuLoad('seo'))
        //     // case 'social':
        //     //   this.props.dispatch(subMenuLoad('social'))
        //     // case 'leads':
        //     //   this.props.dispatch(subMenuLoad('leads'))
        //   }
        // }, 500)

        // this.setState({reveal})
      }
    }
  }
}
