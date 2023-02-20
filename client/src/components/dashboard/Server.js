import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import '../styles/fab.css';
import '../styles/my_servers.css';
import { connectToServer } from '../../actions/serverActions.js';

class Server extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            connection: null,
            server: ''
        };
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
            this.props.history.push('/login');
        } else {
            const { user } = this.props.auth;
            const serverId = this.props.match.params.id;
            this.props.connectToServer(serverId, user.id);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.status.data !== this.props.status.data) {
            this.setState({ ...this.state, connection: this.props.status.data });
        }
    }

    render() {
        const { connection } = this.state;
        return (
            <div>
                {connection != null && <div>{connection.toString()}</div>}
                <div>{this.props.serverError !== {} && <div>{this.props.serverError.toString()}</div>}
                </div>
            </div>
        );
    }
}

Server.propTypes = {
    status: PropTypes.object.isRequired,
    connectToServer: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    serverError: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    serverError: state.serverError,
    status: state.server
});

export default connect(mapStateToProps, { connectToServer })(Server);
