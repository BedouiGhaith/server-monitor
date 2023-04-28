import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { connectToServer } from "../../actions/serverActions.js";
import {SERVER_INSTALL, SERVER_PACKAGES} from "../../actions/types.js";

const PackagesDashboard = (props) => {
    const { match, auth, serverError, status, connectToServer } = props;
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [server, setServer] = useState(match.params.id);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installResult, setInstallResult] = useState(null);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            props.history.push('/dashboard');
        } else {
            const { user } = auth;
            setServer(match.params.id);
            connectToServer(server, user.id, "get packages", SERVER_PACKAGES);
        }
    }, [auth.isAuthenticated, connectToServer, match.params.id, server]);

    useEffect(() => {
        if (status && status.packages && status.packages !== connection) {
            setConnection(status.packages);
        }
    }, [connection, status]);

    useEffect(() => {
        if (status && status.installResult && status.installResult !== installResult) {
            setIsInstalling(false);
            setInstallResult(status.installResult);
        }
    }, [installResult, status]);

    const handleSelect = (index) => {
        setSelectedIndex(index);
    };

    const handleInstall = () => {
        if (selectedIndex !== null) {
            const { user } = auth;
            setServer(match.params.id);
            const selectedPackage = connection[selectedIndex].name;
            connectToServer(server, user.id, `install ${selectedPackage}`, SERVER_INSTALL);
            setIsInstalling(true);
        }
    };

    return (
        <div style={(Object.keys(serverError).length === 0 && connection == null) ? { display: "flex", justifyContent: "center", alignItems: "center", height:"92.5%", width:"100%", position: "absolute"} : {display: "flex",justifyContent: "space-between",alignItems: "center"}}>
            {(Object.keys(serverError).length === 0 && connection == null) && <div className="loader"></div>}
            {connection && (<>
                <ul style={{ height: '200px', overflowY: 'scroll'}}>
                    {connection.map((item, index) => (
                        <li
                            key={item.name}
                            style={{
                                border: '1px solid black',
                                backgroundColor: index === selectedIndex ? 'lightblue' : 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSelect(index)}
                        >
                            <div>{item.name}</div>
                        </li>
                    ))}
                </ul>
                <button onClick={handleInstall} disabled={selectedIndex === null || isInstalling}>Install</button>
            </>)}
            {serverError !== "" && <div>{Object.keys(serverError)}</div>}
        </div>
    );
};

PackagesDashboard.propTypes = {
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

export default connect(mapStateToProps, { connectToServer })(PackagesDashboard);
