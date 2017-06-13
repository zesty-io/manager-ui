import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './styles.less'
import AuditControls from '../../components/controls'
import Log from '../../components/log'
import Pagination from '../../components/pagination'
import {getLogs} from '../../store/logs'

class AuditApp extends Component {
  componentWillMount() {
    this.props.dispatch(getLogs())
  }
  renderLogs() {
    let logs = Object.keys(this.props.inViewLogs)

    if (logs.length) {
      return logs.map(zuid => {
        let log = this.props.inViewLogs[zuid]
        return <Log log={log} key={zuid} />
      })

    } else {
      return (<h1 className={styles.noLogs}>No Logs Found</h1>)

    }
  }
  render() {
    return (
      <main className={styles.auditApp}>
        <div className={this.props.loadingLogs ? styles.loading : styles.hidden}>
          <Loader />
          <h1>LOADING AUDIT TRAIL</h1>
        </div>
        <AuditControls logCount={Object.keys(this.props.inViewLogs).length} />
        <section className={styles.logList}>
          {this.renderLogs()}
        </section>
        <footer className={styles.paginationWrap}>
          <Pagination />
        </footer>
      </main>
    )
  }
}

export default connect(state => state)(AuditApp)
