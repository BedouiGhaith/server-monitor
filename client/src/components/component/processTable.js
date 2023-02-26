import React from 'react';
import  '../styles/process_table.css'
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {connectToServer} from "../../actions/serverActions.js";

let onKillClick = (e,pid, serverId, userId, connectToServer) => {
    e.preventDefault();
    connectToServer(serverId, userId, "sudo kill -9 "+pid);
};

function processTable(props) {
    const { data, serverId } = props;

    // Check if the data prop is defined
    if (!data) {
        return null;
    }

    const { user } = props.auth;

    return (
        <table className="table-process">
            <thead className="thead-process">
            <tr className="tr-process">
                <th className="th-process">PID</th>
                <th className="th-process">USER</th>
                <th className="th-process">CPU</th>
                <th className="th-process">MEMORY</th>
                <th className="th-process">TIME</th>
                <th className="th-process">COMMAND</th>
                <th className="th-process">ACTION</th>
            </tr>
            </thead>
            <tbody className="tbody-process">
            {data.slice(1).map((item) => (
                <tr className="tr-process" key={item.pid}>
                    <td className="td-process">{item.pid}</td>
                    <td className="td-process">{item.user}</td>
                    <td className="td-process">{item.cpu}</td>
                    <td className="td-process">{item.mem}</td>
                    <td className="td-process">{item.time}</td>
                    <td className="td-process">{item.command}</td>
                    <td
                        className="td-process"
                        style={{ display: "flex", justifyContent: "space-around" }}
                    >
                        <button onClick={(e) => onKillClick(e, item.pid, serverId, user.id, props.connectToServer)}>KILL</button>
                        <button>DETAILS</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

processTable.propTypes = {
    status: PropTypes.object.isRequired,
    connectToServer: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    serverError: PropTypes.string.isRequired,
    serverId: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    serverError: state.serverError,
    status: state.server
});

export default connect(mapStateToProps, { connectToServer })(processTable);
