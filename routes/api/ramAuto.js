const User = require("../../models/User");
const Server = require("../../models/Server");
const Ram = require("../../models/Ram");


const { Client } = require('ssh2');

const {sendEmail} = require("../../config/mail");


async function monitorServer() {
    try {
        const srvs = await Server.find();
        const promises = srvs.map(async function (server) {
            try {
                const user = await User.findById(server.owner);
                const conn = await connectToSSHServer({
                    host: server.ip,
                    username: server.username,
                    password: server.password
                });
                const buffer = [];
                conn.exec('free -m && top -b -n 1 -o %MEM | head -n 8 | tail -n 1', (err, stream) => {
                    if (err) {
                        throw err;
                    }
                    stream.on('data', (data) => {
                        buffer.push(data);
                    });
                    stream.on('end', async () => {
                        const lines = Buffer.concat(buffer).toString().split('\n');
                        const usage = lines[1].split(/\s+/).filter(Boolean);
                        const process = lines[3].split(/\s+/).filter(Boolean);
                        const ramDetails = {
                            total: usage[1],
                            used: usage[2],
                            free: usage[3]
                        };
                        const ram = new Ram({
                            total: usage[1],
                            used: usage[2],
                            free: usage[3],
                            server: server.id
                        })
                        const processWithHighestRamUsage = {
                            pid: process[0],
                            user: process[1],
                            pr: process[2],
                            ni: process[3],
                            virt: process[4],
                            res: process[5],
                            shr: process[6],
                            s: process[7],
                            cpu: process[8],
                            mem: process[9],
                            time: process[10],
                            command: process[11]
                        };
                        await Ram.create(ram)
                        conn.end()
                        const ramUsagePercent = (parseFloat(ramDetails.used)*100/parseFloat(ramDetails.total)).toFixed(1)
                        console.log(ramUsagePercent)
                        console.log(processWithHighestRamUsage)
                        console.log(`Server: `+server.name+`\n RAM usage: ${ramUsagePercent}% which it is higher than the limit you've set! Process with highest RAM usage: ${(processWithHighestRamUsage.command)} (PID: ${parseInt(processWithHighestRamUsage.pid)}, RAM usage: ${parseFloat(processWithHighestRamUsage.mem)})`);

                        if (ramUsagePercent>10){
                            sendEmail(user.email,`Server: `+server.name+`\nIP: `+server.ip+`\nRAM usage: ${ramUsagePercent}% which it is higher than the limit you've set! Process with highest RAM usage: ${(processWithHighestRamUsage.command)} (PID: ${parseInt(processWithHighestRamUsage.pid)}, RAM usage: ${parseFloat(processWithHighestRamUsage.mem)}%)`,"high_current_ram_usage")
                        }
                        console.log(ramDetails)
                    });
                });
            } catch (err) {
                console.log(`Error in forEach loop: ${err.message}`);
            }
        });
        await Promise.all(promises);
    } catch (err) {
        console.log(`SSH connection error: ${err.message}`);
    }
}


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

function startMonitoring() {
    setInterval(() => {
        console.log('Monitoring servers...');
        monitorServer()
            .then(() => console.log('All servers monitored'))
            .catch(err => console.log(`Error monitoring servers: ${err.message}`));
    }, 10 * 1000); // run every 60 minutes
}
module.exports = {startMonitoring};
