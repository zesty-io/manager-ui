import React, { Component } from 'react'
import styles from './styles.less'

export default class GlobalMenu extends Component {
  componentWillMount() {
    console.log('GlobalMenu:componentWillMount')
  }
  render() {
    return (
      <menu className={styles.GlobalMenu}>
        <a href="/content" title="Content Editor">
          <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
          <span className={styles.title}>Content</span>
        </a>
        <a href="/media" title="Media Manager">
          <i className="fa fa-picture-o" aria-hidden="true"></i>
          <span className={styles.title}>Media</span>
        </a>
        <a href="/code" title="Code Editor">
          <i className="fa fa-code-fork" aria-hidden="true"></i>
          <span className={styles.title}>Code</span>
        </a>
        <a href="/analytics" title="Analytics">
          <i className="fa fa-pie-chart" aria-hidden="true"></i>
          <span className={styles.title}>Analytics</span>
        </a>
        <a href="/seo">
          <i className="fa fa-line-chart" aria-hidden="true"></i>
          <span className={styles.title}>SEO</span>
        </a>
        <a href="/leads">
          <i className="fa fa-address-card-o" aria-hidden="true"></i>
          <span className={styles.title}>Leads</span>
        </a>
        <a href="/forms">
          <i className="fa fa-envelope-o" aria-hidden="true"></i>
          <span className={styles.title}>Forms</span>
        </a>
        <a href="/social">
          <i className="fa fa-share-square-o" aria-hidden="true"></i>
          <span className={styles.title}>Social</span>
        </a>
        <a href="/audit-trail">
          <i className="fa fa-check-square-o" aria-hidden="true"></i>
          <span className={styles.title}>AuditTrail</span>
        </a>
        <a href="/settings">
          <i className="fa fa-cog" aria-hidden="true"></i>
          <span className={styles.title}>Settings</span>
        </a>
      </menu>
    )
  }
}
