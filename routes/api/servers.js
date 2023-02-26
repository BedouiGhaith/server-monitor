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
async function cmdOption(conn, option, res) {
    console.log(option);
    if (option==="processes"){
            console.log('Processes');
            conn.exec('top -n 1 -b', (err, stream) => {
                executeCMD(err, stream,option, res)
            });
    } else if (option.startsWith('sudo kill')) {
        console.log('kill process');
        conn.exec(option, (err, stream) => {
            executeCMD(err, stream,option, res)
        });
    } else {
        res.status(404).json(`NO OPTION FOR ${option}.`);
        console.log(`NO OPTION FOR ${option}.`);
    }
}

function executeCMD (err, stream,cmd, res) {
    if (err) {
        console.log(`Command execution error: ${err.message}`);
        throw err;
    }

    let dataBuffer = Buffer.from('');
    let response
    stream.on('data', (data) => {
        response = data
        dataBuffer = Buffer.concat([dataBuffer, data]);
    });

    stream.on('end', (code) => {
        if (cmd.startsWith("processes")) {
            const topData = topparser(dataBuffer.toString());
            res.status(200).send(topData);
        } else if (code!==0) {
            res.status(400).json("Insufficient Privileges!");
        } else res.status(200)
        console.log(response)
    }).on('close', (code) => {
        console.log(`Command execution closed with code ${code} `);
    });
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
        await User.findById(mongoose.Types.ObjectId((req.body.user)), async function (err, results) {
            if (err) {
                res.status(404).json(err)
            }
            console.log(results)
            if (results !== null) {
                await Server.findById((mongoose.Types.ObjectId(req.body.server)), async function (err, results) {
                    if (err) {
                        res.status(404).json(err)
                    }
                    if (results !== null) {
                        try {
                            await connectToSSHServer({
                                  host: results.ip,
                                username: results.username,
                                password: results.password
                            }).then(async (conn) => {
                                    // Connection successful, do something with the `conn` object
                                    await cmdOption(conn, req.body.option, res)
                                }).catch((err) => {
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
