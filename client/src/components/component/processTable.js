import React from 'react';
import  '../styles/process_table.css'
import {PROCESS_KILLING} from "../../actions/types.js";

function processTable(props) {
    const { user, data, serverId } = props;

    let onKillClick = (e,pid, serverId, userId, connectToServer) => {
        e.preventDefault();
        connectToServer(serverId, userId, "sudo kill -9 "+pid, PROCESS_KILLING);
    };
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

export default processTable;
