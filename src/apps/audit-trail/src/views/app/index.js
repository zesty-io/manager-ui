import React, { Component } from 'react'
import {connect} from 'react-redux'
import styles from './styles.less'
import {injectReducer} from 'redux-injector'

import AuditControls from '../../components/controls'
import Log from '../../components/log'
import Pagination from '../../components/pagination'

import {getLogs} from '../../store/logs'
import {logs} from '../../store/logs'
import {loadingLogs} from '../../store/loadingLogs'
import {inViewLogs} from '../../store/inViewLogs'
import {settings} from '../../store/settings'

class AuditApp extends Component {
  componentWillMount() {
    console.log('AuditApp:componentWillMount', this)
    // console.log('LOGS', logs)

    // injectReducer('logs', logs)
    // injectReducer('loadingLogs', loadingLogs)
    // injectReducer('inViewLogs', inViewLogs)
    // injectReducer('settings', settings)

    // TODO these settings need to be
    // provided by the app-shell
    // this.props.dispatch({
    //   type: 'APP_SETTINGS',
    //   settings: {
    //     siteZuid: 'xxxxx1',
    //     SITES_SERVICE: 'http://svc.zesty.localdev:3018/sites-service'
    //   }
    // })

    // this.props.dispatch(getLogs())
  }
  // renderLogs() {
  //   let logs = Object.keys(this.props.inViewLogs)

  //   if (logs.length) {
  //     return logs.map(zuid => {
  //       let log = this.props.inViewLogs[zuid]
  //       return <Log log={log} key={zuid} />
  //     })

  //   } else {
  //     return (<h1 className={styles.noLogs}>No Logs Found</h1>)

  //   }
  // }
  render() {
    return (
      <main className={styles.auditApp}>
        <div className={this.props.loadingLogs ? styles.loading : styles.hidden}>
          <Loader />
          <h1>LOADING AUDIT TRAIL</h1>
        </div>
        {/*<AuditControls logCount={Object.keys(this.props.inViewLogs).length} />*/}
        <section className={styles.logList}>
          {/*this.renderLogs()*/}
        </section>
        <footer className={styles.paginationWrap}>
          {/*<Pagination />*/}
        </footer>
      </main>
    )
  }
}

export default connect(state => state)(AuditApp)
