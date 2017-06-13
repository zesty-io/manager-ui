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
          <GlobalAccount />
          <GlobalMenu dispatch={this.props.dispatch} products={this.props.site.settings.products} />
          <GlobalActions />
        </div>
        <div className={cx(styles.subMenu, this.props.globalSubMenu)}>
          <CodeEditorMenu className={cx(styles.appMenu, (this.props.globalSubMenu === 'code' ? styles.show : styles.hide))} />
          <ContentEditorMenu className={cx(styles.appMenu, (this.props.globalSubMenu === 'content' ? styles.show : styles.hide))} />
          <MediaMenu className={cx(styles.appMenu, (this.props.globalSubMenu === 'media' ? styles.show : styles.hide))} />
        </div>
      </aside>
    )
  }
}
