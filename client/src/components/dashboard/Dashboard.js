import React, { Component } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import "../styles/fab.css"
import "../styles/my_servers.css"


class Dashboard extends Component{

    constructor() {
        super();
        this.state = {
            isFetching: false,
            data: []
        };
    }

    componentDidMount() {
        if (!this.props.auth.isAuthenticated) {
            this.props.history.push("/login");
        }
        const { user } = this.props.auth;
        this.setState({...this.state, isFetching: true});
        axios.post("http://localhost:5000/api/servers/get_servers/", {
            owner: user.id,
        })
            .then(response => {
                this.setState({data: response.data, isFetching: false})
                console.log(response.data
                )
            })
            .catch(e => {
                console.log(e);
                this.setState({...this.state, isFetching: false});
            });
    };

render() {
    const content = this.state.data.map((server) =>
        <div key={"div_"+server._id} style={{border: "solid lightgrey", borderWidth: "1px 1px"}}>
            <a key={"link_"+server._id} href={"/server/" + server._id} className="productlink">
                <div key={server._id} className= 'card-container' >
                    <div key={"content_"+server._id} className='content-container'>
                        <div key={"title_"+server._id} className='title'>{server.name}</div>
                        <div key={"ip_"+server._id} className='ip'>{server.ip}</div>
                        <div key={"desc_"+server._id} className='description'>{server.description}</div>
                    </div>
                </div>
            </a> </div>
    );
    return (
        <div id={"container"} style={{display:"flex",flexWrap:"wrap", rowGap: "50px", gap: "90px",float:"none",justifyContent:"flex-start", margin:"100px"}}>
            {!this.state.isFetching? content:"loading..."}
            <a href="/addServer" className="fab">+</a>
        </div>
    );
}
}

Dashboard.propTypes = {
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(mapStateToProps, {  })(Dashboard);
