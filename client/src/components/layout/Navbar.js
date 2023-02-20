import React, { Component } from "react";
import "../styles/navbar.css"
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions.js";


class Navbar extends Component {
    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

  render() {
      return (
        <div className="navbar">
            <a href="/">Home</a>
            <a href="/">News</a>
            <div className="dropdown" style={{float:"right"}}>
                <button className="dropbtn">Account
                    <i className="fa fa-caret-down"></i>
                </button>
                <div className="dropdown-content" >
                    {(this.props.auth.isAuthenticated)?<button
                        onClick={this.onLogoutClick}
                    >
                        Logout
                    </button>:<button>Login</button>}
                </div>
            </div>
        </div>
    );
  }
}
Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(Navbar);

