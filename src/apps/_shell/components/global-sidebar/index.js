import React, { Component } from 'react'
import styles from './styles.less'
import cx from 'classnames'

import GlobalAccount from '../global-account'
import GlobalMenu from '../global-menu'
import GlobalActions from '../global-actions'

import CodeEditorMenu from '../../../code-editor/code-editor-menu'
import ContentEditorMenu from '../../../content-editor/content-editor-menu'
import MediaMenu from '../../../media/media-menu'

export default class GlobalSidebar extends Component {
  componentWillMount() {
    console.log('GlobalSidebar:componentWillMount', this)
  }
  render() {
    return (
      <aside className={styles.GlobalSidebar}>
        <div className={styles.topMenu}>
          <GlobalAccount dispatch={this.props.dispatch} />
          <GlobalMenu dispatch={this.props.dispatch} products={this.props.site.settings.products} />
          <GlobalActions />
        </div>
        <div className={cx(styles.subMenu, this.props.globalSubMenu.location)}>
          <CodeEditorMenu className={cx(styles.appMenu, (this.props.globalSubMenu.location === 'code' ? styles.show : styles.hide))} />
          <ContentEditorMenu className={cx(styles.appMenu, (this.props.globalSubMenu.location === 'content' ? styles.show : styles.hide))} />
          <MediaMenu className={cx(styles.appMenu, (this.props.globalSubMenu.location === 'media' ? styles.show : styles.hide))} />
        </div>
        <div className={cx(styles.accountMenu, (this.props.accountsMenuVisible ? styles.show : styles.hide))}>
          <h1>Stuart Runyan</h1>
          <ul className={styles.linkList}>
            <li className={styles.link}>Accounts Dashboard</li>
            <li className={styles.link}>User Settings</li>
            <li className={styles.link}>Logout</li>
          </ul>
        </div>
      </aside>
    )
  }
}
