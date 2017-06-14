import React, { Component } from 'react'
import cx from 'classnames'
import styles from './styles.less'

import {toggleAccountsMenu} from '../../store/accounts-menu'
import {subMenuLoad} from '../../store/global-sub-menu'

export default class GlobalAccount extends Component {
  constructor(props) {
    super(props)
    this.showAccountsMenu = this.showAccountsMenu.bind(this)
    this.hideAccountsMenu = this.hideAccountsMenu.bind(this)
  }
  render() {
    return (
      <section
        className={cx(styles.accountMenu, (this.props.accountsMenuVisible ? styles.show : styles.hide))}
        onMouseEnter={this.showAccountsMenu}
        onMouseLeave={this.hideAccountsMenu}>

        <header className={styles.user}>
          <h1>
            <i className={cx(styles.icon, "fa fa-user-circle-o")} aria-hidden="true"></i>
            Stuart Runyan
          </h1>
        </header>

        <main className={styles.siteSelector}>
          <Select selection={{value: 'xxxxx1', html: 'alphauniverse.com'}}>
            <Option value="xxxxx1" text="alphauniverse.com" />
          </Select>
        </main>

        <menu className={styles.accountActions}>
          <ul className={styles.linkList}>
            <li className={styles.link}>
              <i className={cx(styles.icon, "fa fa-tachometer")} aria-hidden="true"></i>Dashboard
            </li>
            <li className={styles.link}>
              <i className={cx(styles.icon, "fa fa-life-ring")} aria-hidden="true"></i>Support
            </li>
            <li className={styles.link}>
              <i className={cx(styles.icon, "fa fa-sign-out")} aria-hidden="true"></i>Logout
            </li>
          </ul>
        </menu>
      </section>
    )
  }
  showAccountsMenu() {
    this.props.dispatch(subMenuLoad(''))
    this.props.dispatch(toggleAccountsMenu(true))
  }
  hideAccountsMenu() {
    this.props.dispatch(toggleAccountsMenu(false))
  }
}


