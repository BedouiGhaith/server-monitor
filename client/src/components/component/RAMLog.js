import React, { useEffect, useState } from "react";
import "../styles/h_cards.css";
import axios from "axios";

function RAMLog(props) {
    const [groupedData, setGroupedData] = useState({});

    async function fetchRamLog() {
        const connectionData = {
            server: props.serverId,
            user: props.userId,
            option: "grep -i -r 'memory' /var/log/",
        };
        try {
            const response = await axios.post(
                "http://localhost:5000/api/servers/connectToServer/",
                connectionData
            );
            return response.data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    useEffect(() => {
        async function fetchData() {
            const result = await fetchRamLog();
            const dataByTimestamp = {};
            result.forEach((log) => {
                const timestamp = log.timestamp.substring(0, 6);
                if (dataByTimestamp[timestamp]) {
                    dataByTimestamp[timestamp].push(log);
                } else {
                    dataByTimestamp[timestamp] = [log];
                }
            });
            setGroupedData(dataByTimestamp);
        }
        fetchData();
    }, []);

    return (
        <div className="container">
            <h2>Log Messages</h2>
            <ul className="cards">
                {Object.entries(groupedData).map(([timestamp, logs]) => (
                    <li className="card" key={timestamp}>
                        <div>
                            <h3 className="card-title">{timestamp}</h3>
                            {logs.map((log, index) => (
                                <div className="card-content" key={index}>
                                    <p>{log.description}</p>
                                    <p>{log.cause}</p>
                                    <p>{log.solution}</p>
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RAMLog;
