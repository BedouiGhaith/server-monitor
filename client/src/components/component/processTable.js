import React from 'react';
import  '../styles/process_table.css'

function processTable(props) {
    const { data } = props;

    return (
        <table>
            <thead>
            <tr>
                <th>PID</th>
                <th>USER</th>
                <th>CPU</th>
                <th>MEMORY</th>
                <th>TIME</th>
                <th>COMMAND</th>
            </tr>
            </thead>
            <tbody>
            {(data).slice(1).map(item => (
                <tr key={item.pid}>
                    <td>{item.pid}</td>
                    <td>{item.user}</td>
                    <td>{item.cpu}</td>
                    <td>{item.mem}</td>
                    <td>{item.time}</td>
                    <td>{item.command}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default processTable;