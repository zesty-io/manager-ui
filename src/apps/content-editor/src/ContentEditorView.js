import React, { Component } from 'react'
import styles from './ContentEditorView.less'

export default class ContentEditorView extends Component {
  componentWillMount() {
    console.log('ContentEditorView:componentWillMount')
  }
  render() {
    return (
      <section className={styles.ContentEditorView}>
        <header className={styles.ContentActions}>
          <Link>
            <i className="fa fa-arrow-left" aria-hidden="true"></i>Back
          </Link>
          <ButtonGroup>
            <Button>
              <i className="fa fa-floppy-o" aria-hidden="true"></i>Save
            </Button>
            <Button>
              <i className="fa fa-cog" aria-hidden="true"></i>Settings
            </Button>
          </ButtonGroup>
        </header>
        <main className={styles.content}>
        Content App

        <form>
           <textarea col="10" row="10">TEST</textarea>

        </form>

        </main>
      </section>
    )
  }
}
