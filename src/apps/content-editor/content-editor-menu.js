import React, { Component } from 'react'
import {injectReducer} from 'redux-injector'
import cx from 'classnames'
import styles from './content-editor-menu.less'

import {sets} from './store/sets'
import {items} from './store/items'

export default class ContentEditorMenu extends Component {
  componentWillMount() {
    injectReducer('sets', sets)
    injectReducer('items', items)

    console.log('ContentEditorMenu:componentWillMount', this)
  }
  render() {
    return (
      <section className={cx(styles.ContentEditorMenu, this.props.className)}>
        <header>
          <button>filter</button>
          <input type="text" />
        </header>
        <main className={styles.content}>
          Content Editor Menu
          {/*Object.keys(this.props.sets).map(zuid => {
            let set = this.props.sets[zuid]
            return (<h1 key={zuid}>{set.name}</h1>)
          })*/}
        </main>
      </section>
    )
  }
}
