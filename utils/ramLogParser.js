const parseMemoryInfo = (output) => {
    output.trim()
    output=removeLines(output,5,5)

    console.log(output)
    const events = output.trim().split('\n');
    const memoryInfo = { events: [] };
    events.forEach(event => {
        const [timestamp, message] = event.split(/](.*)/s);
        const colonIndex = message.indexOf(':');
        const type = message.slice(0, colonIndex).trim();
        const description = message.slice(colonIndex + 1).trim();
        memoryInfo.events.push({
            timestamp: timestamp.slice(1),
            type,
            description,
            cause: getEventCause(type, description),
            fix: getEventFix(type, description),
        });
    });
    return memoryInfo;
};

async function parseGrepMemoryLog(output) {
    console.log("--------------------------------------------------------------------------------------------------------")

    console.log(output)
    output = output.trim();
    output = removeLines(output, 5, 5);
    const logs = output.split("\n");
    const parsedLogs = [];
    for (const log of logs) {
        if (
            log.toLowerCase().includes("out of memory") &&
            !log.toLowerCase().includes("command")
        ) {
            if (log.trim() === "") continue;
            const logParts = log.split(" ");
            const firstPart= logParts.shift().split(":")
            const id = firstPart[0];
            const timestamp = `${firstPart[1]} ${logParts.shift()} ${logParts.shift()} ${
                logParts.shift()
            }`;
            const host = logParts.shift().replace(":","");
            const error = logParts.slice(0, 3).join(" ").replace(":","");
            const description = logParts.slice(3).join(" ").replace(/\r/g, "");
            const parsedLog = {
                id,
                timestamp,
                host,
                error,
                description,
                cause: "",
                solution: "",
                pid: -1
            };
            if (error === "Out of memory") {
                // Analyze the error message to determine the cause and possible solution
                if (description.startsWith("Kill process")) {
                    const processParts = description.split(" ");
                    const pid = processParts[2];
                    const score = processParts[5];
                    parsedLog.pid = pid;
                    parsedLog.cause = `The process with PID ${pid} was killed due to out-of-memory conditions. It had a score of ${score}, indicating that it was using a significant amount of memory.`;
                    parsedLog.solution = `To prevent this from happening in the future, you can try reducing the memory usage of the process, or add more memory to the system.`;
                } else if (description.startsWith("oom-kill")) {
                    parsedLog.cause = `The kernel killed a process due to out-of-memory conditions.`;
                    parsedLog.solution = `To prevent this from happening in the future, you can try adding more memory to the system, or reduce the memory usage of the running processes.`;
                }
            }
            parsedLogs.push(parsedLog);
        }
    }            console.log(parsedLogs)

    return parsedLogs;
}



const getEventCause = (type, description) => {
    switch (type) {
        case 'Out of memory':
            return 'The system ran out of available memory.';
        case 'Memory allocation error':
            return `The system was unable to allocate memory for ${description}.`;
        case 'Memory pressure':
            return 'The system is under memory pressure, and may need more memory or fewer running processes.';
        default:
            return 'Unknown';
    }
};

const getEventFix = (type, description) => {
    switch (type) {
        case 'Out of memory':
            return 'Upgrade the system memory or reduce the memory usage of running processes.';
        case 'Memory allocation error':
            return `Check if ${description} has any known memory issues or requires more memory than the system can provide.`;
        case 'Memory pressure':
            return 'Add more memory to the system or reduce the number of running processes.';
        default:
            return 'Unknown';
    }
};

const removeLines = (str, n, m) => {
    const lines = str.split('\n');
    lines.splice(0, n);
    lines.splice(-m, m);
    return lines.join('\n');
};

module.exports = { parseMemoryInfo, parseGrepMemoryLog, removeLines }

