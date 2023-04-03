import React, { Component } from 'react';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {connectToServer} from "../../actions/serverActions.js";
import RAMUsageChart from "../component/RAMUsageChart";
import RAMLog from "../component/RAMLog.js";
import LinearChart from "../component/LinearChart.js";

class RAMDashboard extends Component {constructor(props) {
    super(props);

    this.state = {
        server: this.props.match.params.id
    };
}

    render() {
        const {server} = this.state
        const { user } = this.props.auth;
        return (
            <div>
                <LinearChart userId={user.id} serverId={server}></LinearChart>
               <RAMUsageChart userId={user.id} serverId={server} ></RAMUsageChart>
                <RAMLog userId={user.id} serverId={server}></RAMLog>
            </div>
        );
    }
}
RAMDashboard.propTypes = {
    status: PropTypes.object.isRequired,
    connectToServer: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    serverError: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    serverError: state.serverError,
    status: state.server
});

export default connect(mapStateToProps, { connectToServer })(RAMDashboard);
