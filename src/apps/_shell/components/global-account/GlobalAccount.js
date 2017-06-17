import React, { Component } from 'react'
import cx from 'classnames'
import css from './GlobalAccount.less'

import {toggleAccountsMenu} from '../../store/ui/global-accounts-menu'
import {subMenuLoad} from '../../store/ui/global-sub-menu'

export default class GlobalAccount extends Component {
  constructor(props) {
    super(props)
    this.showAccountsMenu = this.showAccountsMenu.bind(this)
    this.hideAccountsMenu = this.hideAccountsMenu.bind(this)
  }
  render() {
    return (
      <div
        className={css.GlobalAccount}
        onMouseEnter={this.showAccountsMenu}
        onMouseLeave={this.hideAccountsMenu}>
        <i className="fa fa-globe" aria-hidden="true"></i>
      </div>
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
