const {removeLines} = require("./ramLogParser");


module.exports = function parsePackagesList(output) {
    output = removeLines(output, 12, 5).replaceAll("\n"," ").replaceAll("\r","")
    return output.split(' ').reduce((acc, curr, index, arr) => {
        if (index % 1 === 0) {
            acc.push({
                name: curr
            });
        }
        return acc;
    }, []);
}


