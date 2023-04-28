const express = require('express');
const router = express.Router();

const User = require("../../models/User");
const Server = require("../../models/Server");
const mongoose = require("mongoose");


const { Client } = require('ssh2');

const topparser = require("../../utils/topParser");
const privParser = require("../../utils/privParser");
const {parseMemoryInfo, parseGrepMemoryLog} = require("../../utils/ramLogParser");
const {sendEmail} = require("../../config/mail");
const parsePackagesList = require("../../utils/packagesParser");


async function connectToSSHServer(server) {
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

function executeSudoCommand(conn, option, res, sudoPass) {
    console.log(option);
    const password = sudoPass;
    let output = '';

    conn.shell((err, stream) => {
        if (err) {
            console.log(`Command execution error: ${err.message}`);
            throw err;
        }
        stream.on('end', async _ => {
            console.log(`Command execution ended`);
            console.log(output)
            conn.end()
            res.status(200).json(await parser(output, option));
        }).on('data', (data) => {
            if (data.indexOf('Password') > -1) {
                stream.end(`${password}\n${option}\nexit\nexit\n`);
            } else {
                output += data;
                console.log(data.toString())
            }
        });
        stream.write(`su\n`);
    })
}

async function cmdOption(conn, option, res, sudoPass) {
    if (!option || option ==="") {
        console.log('nothing');
        return res.json("nothing chosen").status(200)
    } else if (option === "processes") {
        console.log('Processes');
        conn.exec('top -n 1 -b', (err, stream) => {
            executeCMD(err, stream, option, res, conn)
        });
    } else if (option.startsWith('sudo kill')) {
        console.log('kill process');
        executeSudoCommand(conn, option, res, sudoPass);
    } else if (option.startsWith('dmesg | grep -i memory')) {
        console.log('ram diag');
        executeSudoCommand(conn, option+ " --color=never", res, sudoPass);
    } else if (option.startsWith('grep -i -r \'memory\' /var/log/')) {
        console.log('ram var log');
        executeSudoCommand(conn, option+ " --color=never", res, sudoPass);
    } else if (option.startsWith('sudo -l')) {
        console.log('privileges');
        executeSudoCommand(conn, option, res);
    } else if (option.startsWith('install')) {
        let pckg = option.replace("install ", "");
        console.log('ram var log');
        await installPackage(conn, pckg, res, sudoPass);
    }else if (option.startsWith('get packages')) {
        console.log('ram var log');
        await getAllPackages(conn, res, sudoPass);
    } else {
        console.log(`${option}.`);
        executeSudoCommand(conn, option, res);
    }
}

function executeCMD(err, stream, cmd, res, conn) {
    if (err) {
        console.log(`Command execution error: ${err.message}`);
        throw err;
    }

    let dataBuffer = Buffer.from('');
    let response;

    stream.on('data', (data) => {
        response = data;
        dataBuffer = Buffer.concat([dataBuffer, data]);
    });
    stream.on('end', (code) => {
        console.log(code)
        conn.end()
        if (code) {
            res.status(400).json('Insufficient Privileges!');
        } else res.status(200).json(parser(dataBuffer,cmd));
        console.log(response);
    }).on('close', (code) => {
        console.log(`Command execution closed with code ${code}`);
    });
}

function parser(data, option){
    console.log(option)
    if (option.startsWith('processes')) {
        return topparser(data.toString());
    }
    if (option.startsWith('sudo -l')) {
        return privParser(data.toString());
    }
    if (option.startsWith('dmesg | grep -i memory')) {
        data.replaceAll("STDOUT: ","")
        return parseMemoryInfo(data.toString());
    }
    if (option.startsWith('grep -i -r \'memory\' /var/log/')) {
        data.replaceAll("STDOUT: ","")
        return parseGrepMemoryLog(data.toString());
    }
    if (option.startsWith('yum list available')) {
        console.log('ram var log');
        return parsePackagesList(data.toString())
    }
    return {"data":data}
}
function getPackageInfo(conn, option, sudoPass) {
    console.log(option);
    const password = sudoPass;
    let output = Buffer.alloc(0);

    return new Promise((resolve, reject) => {
        conn.shell((err, stream) => {
            if (err) {
                console.log(`Command execution error: ${err.message}`);
                reject(err);
            }
            stream.on('end', () => {
                console.log(`Command execution ended`);
                console.log(output.toString());
                resolve(output.toString());
            }).on('data', (data) => {
                if (data.indexOf('Password') > -1) {
                    stream.end(`${password}\n${option}\nexit\nexit\n`);
                } else {
                    output = Buffer.concat([output, data]);
                }
            });
            stream.write(`su\n`);
        });
    });
}


async function installPackage(conn, package_name, res, sudoPass) {
    const distro_info = await getPackageInfo(conn, 'ls /etc/*-release', sudoPass)
    const pkg = package_name.split(' ').slice(1).join(' ')
    if (distro_info.toLowerCase().includes('debian')) {
        await executeSudoCommand(conn, `apt-get update -y && apt-get install ${pkg} -y`,res, sudoPass);
    } else if (distro_info.toLowerCase().includes('red hat') || distro_info.toLowerCase().includes('centos')) {
        await executeSudoCommand(conn, `yum install ${package_name} -y`,res, sudoPass);
    } else {
        console.log('Unsupported distribution');
    }
}

async function getAllPackages(conn, res, sudoPass) {
    const distro_info = await getPackageInfo(conn, 'ls /etc/*-release', sudoPass)
    if (distro_info.toLowerCase().includes('debian')) {
        await executeSudoCommand(conn, `dpkg --get-selections`,res, sudoPass);
    } else if (distro_info.toLowerCase().includes('red hat') || distro_info.toLowerCase().includes('centos')) {
        await executeSudoCommand(conn, 'yum list available | grep -v installed | tr -s \' \' | cut -d \' \' -f1\n',res, sudoPass);
    } else {
        console.log('Unsupported distribution');
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
                                    await cmdOption(conn, req.body.option, res, results.password)
                                }).catch((err) => {
                                    // Connection failed, handle the error
                                    console.log(`SSH connection error: ${err.message}`);
                                    res.status(404).json(`SSH connection error: ${err.message}`);
                            });
                        } catch (err) {
                            res.status(404).json(`SSH connection error: ${err.message}... Make sure you've entered the correct server info!`);
                        }
                    } else res.status(404).json("Server Not Found")
                })
            } else res.status(404).json("User Not Found")
        })
    });

router.post('/ramUsage', async (req, res) => {
    console.log(req.body.user + ":" + req.body.server);
    try {
        const user = await User.findById(req.body.user);
        if (!user) {
            return res.status(404).json("User Not Found");
        }

        const server = await Server.findById(req.body.server);
        if (!server) {
            return res.status(404).json("Server Not Found");
        }

        const conn = await connectToSSHServer({
            host: server.ip,
            username: server.username,
            password: server.password
        });

        const buffer = [];
        conn.exec('free -m', (err, stream) => {
            if (err) {
                throw err;
            }
            stream.on('data', (data) => {
                buffer.push(data);
            });
            stream.on('end', () => {
                const lines = Buffer.concat(buffer).toString().split('\n');
                const usage = lines[1].split(/\s+/).filter(Boolean);
                res.status(200).json({
                    total: usage[1],
                    used: usage[2],
                    free: usage[3]
                });
                conn.end()
            });
        });
    } catch (err) {
        console.log(`SSH connection error: ${err.message}`);
        res.status(404).json(`SSH connection error: ${err.message}... Make sure you've entered the correct server info!`);
    }
});


module.exports = router;
