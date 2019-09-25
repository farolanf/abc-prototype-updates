import React, { Component } from 'react';
import PT from 'prop-types';
import './MainHeader.scss';

// MainHeader component
class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.toggleNotifications = this.toggleNotifications.bind(this);
    this.listener = this.listener.bind(this);

    this.state = {
      isNotificationsVisible: false
    }
  }

  componentDidMount(){
    document.querySelector('body').addEventListener('click', this.listener);
  }

  componentWillUnmount(){
    document.querySelector('body').removeEventListener('click', this.listener);
  }

  logout() {
    this.props.logout();
  }

  readNotifications(){
    if(!this.state.isNotificationsVisible){
      this.props.readNotifications().then(resp=>{
        if(resp.ok){
          this.props.getNotifications();
        }
      });
    }
  }

  toggleNotifications(e) {
    e.stopPropagation();
    this.setState({
      isNotificationsVisible: !this.state.isNotificationsVisible
    }, this.readNotifications);
  }

  listener(e){
    if(!this.notiEle.contains(e.target) && this.state.isNotificationsVisible){
      this.setState({
        isNotificationsVisible: false
      }, this.readNotifications);
    }
  }

  render() {
    const { params: {notifications}, noSearch } = this.props;

    return (
      <header className="main-header">
        {
          <div className="search-bar">
            <div className="header-title">
              Managed Print Services Front End Portal EMEA            
            </div>
          </div>
        }
        {/* /.search-bar */}
        <ul className="header-options">
          <li className="notification" ref={e=>this.notiEle=e}>
            <a className="btn-noti" onClick={(e) => this.toggleNotifications(e)}>
              {notifications.list.length > 0 && <span className="count">{notifications.total > 100 ? '99+' : notifications.list.length}</span>}
            </a>
            <div className={"notification-window " + (this.state.isNotificationsVisible ? 'open' : '')} >
              <h4>Notifications</h4>
              <ul className="notification-list">
                {
                  notifications.list.map((item, i) => (<li key={i}>
                      <div className={"msg " + item.type}><div className="msg-text">{item.message}<br /><span className="query-id">Query ID <a>{item.queryId}</a></span></div><span className="timestamp">{item.timestamp}</span> </div>
                    </li>)
                  )
                }
              </ul>
            </div>
          </li>
          <li className="li-logout">
            <a className="btn-logout" onClick={this.logout}> </a>
          </li>
        </ul>
      </header>
    );
  }
}

MainHeader.propType = {
  params: PT.object,
  logout: PT.func
}

export default MainHeader;
