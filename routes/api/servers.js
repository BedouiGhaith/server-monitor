const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Server = require("../../models/Server");
const mongoose = require("mongoose");


const { Client } = require('ssh2');
const topparser = require("../../utils/topParser");

function connectToSSHServer(server) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            console.log('SSH connection successful');
            resolve(conn);
        }).on('error', (err) => {
            console.log(`SSH connection error: ${err.message}`);
            reject(err);
        }).connect({
            host: server.host,
            port: server.port || 22,
            username: server.username,
            password: server.password
        });
    });
}
function cmdOption(conn, option, res){

    switch (option) {
        case 'processes':
            console.log('Processes');
            conn.exec('top -n 1 -b', (err, stream) => {
                if (err) {
                    console.log(`Command execution error: ${err.message}`);
                    throw err;
                }
                stream.on('data', (data) => {
                    let topData=topparser(data+"")
                    console.log(`Received data: ${JSON.stringify(topData.processes[0],0,2)}`);
                    res.status(200).send(topData)
                }).on('close', (code, signal) => {
                    console.log(`Command execution closed with code ${code} and signal `+ signal);
                });
            })
            break;
        default:
            res.status(404).json(`NO OPTION FOR ${option}.`);
            console.log(`NO OPTION FOR ${option}.`);
    }
}


router.post("/add_server", (req, res) => {
    console.log(req.body.owner)
    Server.findOne({ ip: req.body.ip }).then(server => {
        if (server) {
            return res.status(400).json({ ip: "Server already exists" });
        } else {
            const newServer = new Server({
                name: req.body.name,
                ip: req.body.ip,
                username: req.body.username,
                password: req.body.password,
                description: req.body.description,
                owner: req.body.owner,
            });
             Server.create(newServer)
                 .then(server => res.json(server))
                 .catch(err => res.status(404).json(err));
        }
    });
});

router.post("/get_servers", (req, res) => {
    console.log(req.body.owner)
    Server.find({owner :mongoose.Types.ObjectId(req.body.owner)})
                .then(servers => res.json(servers))
                .catch(err => res.status(404).json(err));
});

router.post('/connectToServer', async (req, res) => {
    console.log(req.body.user+":"+req.body.server)
        await   User.findById(mongoose.Types.ObjectId((req.body.user)), async function (err, results) {
            if (err) {
                res.status(404).json(err)
            }
            console.log(results)
            if (results !== null) {
                Server.findById((mongoose.Types.ObjectId(req.body.server)), async function (err, results) {
                    if (err) {
                        res.status(404).json(err)
                    }
                    if (results !== null) {
                        try {
                            connectToSSHServer({
                                host: results.ip,
                                username: results.username,
                                password: results.password
                            }).then((conn) => {
                                cmdOption(conn,req.body.option,res)}
                                // Connection successful, do something with the `conn` object
                                ).catch((err) => {
                                // Connection failed, handle the error
                                console.log(`SSH connection error: ${err.message}`);
                            });

                        } catch (err) {
                            res.status(404).json(`SSH connection error: ${err.message}... Make sure you've entered the correct server info!`);
                        }
                    } else res.status(404).json("Server Not Found")
                })
            } else res.status(404).json("User Not Found")
        })
    });



module.exports = router;
