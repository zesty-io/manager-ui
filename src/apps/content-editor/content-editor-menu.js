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
        <header className={styles.head}>
          <Search placeholder="Search your content" />
        </header>
        <main className={styles.content}>
          {/*Object.keys(this.props.sets).map(zuid => {
            let set = this.props.sets[zuid]
            return (<h1 key={zuid}>{set.name}</h1>)
          })*/}

          <ul className={styles.binList}>
            <li className={styles.bin}>
              <h1 className={styles.title}>
                Pages
                <Button><i className="fa fa-plus" aria-hidden="true"></i></Button>
              </h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>Homepage</li>
                <li className={styles.group}>Articles
                  <ul className={styles.groupList}>
                    <li className={styles.group}>Authors</li>
                    <li className={styles.group}>Categories</li>
                    <li className={styles.group}>Tags</li>
                  </ul>
                </li>
                <li className={styles.group}>About Us</li>
              </ul>
            </li>
            <li className={styles.bin}>
              <h1 className={styles.title}>
                DataSets
                <Button><i className="fa fa-plus" aria-hidden="true"></i></Button>
              </h1>
              <ul className={styles.groupList}>
                <li className={styles.group}>Products</li>
              </ul>
            </li>
          </ul>
        </main>
      </section>
    )
  }
}
