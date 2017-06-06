import React, { Component } from 'react'
import {Link} from 'react-router-dom'
import styles from './styles.less'

import {showSubMenu} from '../../actions/sub-menu'

export default class GlobalMenu extends Component {
  constructor(props) {
    super(props)

    this.hideMenu = this.hideMenu.bind(this)
    this.showMenu = this.showMenu.bind(this)
  }
  componentWillMount() {
    console.log('GlobalMenu:componentWillMount')
  }
  render() {
    return (
      <menu className={styles.GlobalMenu}>
        <Link to="/content" title="Content Editor" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
          <span className={styles.title}>Content</span>
        </Link>
        <Link to="/media" title="Media Manager" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-picture-o" aria-hidden="true"></i>
          <span className={styles.title}>Media</span>
        </Link>
        <Link to="/code" title="Code Editor" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-code-fork" aria-hidden="true"></i>
          <span className={styles.title}>Code</span>
        </Link>
        <Link to="/analytics" title="Analytics" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-pie-chart" aria-hidden="true"></i>
          <span className={styles.title}>Analytics</span>
        </Link>
        <Link to="/seo" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-line-chart" aria-hidden="true"></i>
          <span className={styles.title}>SEO</span>
        </Link>
        <Link to="/leads" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-address-card-o" aria-hidden="true"></i>
          <span className={styles.title}>Leads</span>
        </Link>
        <Link to="/forms" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-envelope-o" aria-hidden="true"></i>
          <span className={styles.title}>Forms</span>
        </Link>
        <Link to="/social" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-share-square-o" aria-hidden="true"></i>
          <span className={styles.title}>Social</span>
        </Link>
        <Link to="/audit-trail" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-check-square-o" aria-hidden="true"></i>
          <span className={styles.title}>AuditTrail</span>
        </Link>
        <Link to="/settings" onMouseEnter={this.showMenu} onMouseLeave={this.hideMenu}>
          <i className="fa fa-cog" aria-hidden="true"></i>
          <span className={styles.title}>Settings</span>
        </Link>
      </menu>
    )
  }
  hideMenu() {
    this.props.dispatch(showSubMenu(''))
  }
  showMenu(evt) {
    console.log('showMenu', this)

    if (evt.target.href) {
      const currentHref = window.location.pathname
      const hoveredHref = evt.target.href.split('/')[3]

      if (currentHref.indexOf(hoveredHref) === -1) {
        switch(hoveredHref) {
          case 'content':
            this.props.dispatch(showSubMenu('content'))
            break;
          case 'media':
            this.props.dispatch(showSubMenu('media'))
            break;
          case 'code':
            this.props.dispatch(showSubMenu('code'))
            break;
          // case 'analytics':
          //   this.props.dispatch(showSubMenu('analytics'))
          // case 'seo':
          //   this.props.dispatch(showSubMenu('seo'))
          // case 'social':
          //   this.props.dispatch(showSubMenu('social'))
          // case 'leads':
          //   this.props.dispatch(showSubMenu('leads'))
        }
      }
    }
  }
}
