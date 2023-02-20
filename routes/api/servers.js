const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Server = require("../../models/Server");
const mongoose = require("mongoose");


const { Client } = require('ssh2');

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
                            const conn = await connectToSSHServer({
                                host: results.ip,
                                username: results.username,
                                password: results.password
                            });
                            // Do something with the SSH client connection
                            res.status(200).json('SSH connection successful');
                        } catch (err) {
                            res.status(404).json(`SSH connection error: ${err.message}`);
                        }
                    } else res.status(404).json("Server Not Found")
                })
            } else res.status(404).json("User Not Found")
        })
    });

module.exports = router;
