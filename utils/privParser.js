module.exports = function parseSudoLOutput(output) {

    const pattern = /^User (\w+) may run the following commands on (\w+):\r\n((?:\s+.*\r\n)+)/gm;
    const matches = pattern.exec(output);
    if (matches) {
        const [, username, hostname, permissionsStr] = matches;
        const permissions = permissionsStr.trim().split('\r\n').map((p) => p.trim());
        return { username, hostname, permissions };
    }
    return null;
}

