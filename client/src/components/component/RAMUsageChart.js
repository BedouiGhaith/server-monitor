import React, { useState, useEffect } from 'react';
import axios from "axios";
import CanvasJSReact from '../../assets/canvasjs.react';
import GaugeChart from "./GaugeChart.js";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

var data = new Array(10).fill(0);
let currentRamCap = 1

function RamUsageChart(props) {
    const [ramUsage, setRamUsage] = useState({});

    function ramUsagePer(used, total){
        if(used.used) {
            console.log(used.used + ":" + total + "=" + Math.round(parseInt(used.used) * 100 / parseInt(total)))
            return Math.round(parseInt(used.used) * 1000 / parseInt(total)) / 10
        }
    }


    async function fetchRamUsage() {
        const connectionData = {
            user: props.userId,
            server: props.serverId,
        };
        return axios
            .post("/api/servers/RAMUsage/", connectionData)
            .then(response => {
                console.log(response)
                currentRamCap = response.data.total
                setRamUsage(response.data);
                data.shift()
                data.push(response.data)
                console.log(data[9])
            })
            .catch(err => {
                console.log(err)
            });
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchRamUsage().then();
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", // "light1", "dark1", "dark2"
        title:{
            text: "Bounce Rate by Week of Year"
        },
        axisY: {
            title: "Usage",
            includeZero: false,
            suffix: "%"
        },
        axisX: {
            title: "Seconds",
            prefix: "S",
            interval: 2
        },
        data: [{
            type: "line",
            toolTipContent: "At {x}: {y}%",
            dataPoints: [
                { x: 0, y: ramUsagePer(data[9],currentRamCap) },
                { x: 2, y: ramUsagePer(data[8],currentRamCap) },
                { x: 4, y: ramUsagePer(data[7],currentRamCap) },
                { x: 6, y: ramUsagePer(data[6],currentRamCap) },
                { x: 8, y: ramUsagePer(data[5],currentRamCap) },
                { x: 10, y: ramUsagePer(data[4],currentRamCap) },
                { x: 12, y: ramUsagePer(data[3],currentRamCap) },
                { x: 14, y: ramUsagePer(data[2],currentRamCap) },
                { x: 16, y: ramUsagePer(data[1],currentRamCap) },
                { x: 18, y: ramUsagePer(data[0],currentRamCap) },
            ]
        }]
    }
    return (
        <div>
            <p>Total RAM: {ramUsage.total} MB</p>
            <p>Used RAM: {ramUsage.used} MB</p>
            <p>Free RAM: {ramUsage.free} MB</p>
            <CanvasJSChart options = {options}
                /* onRef={ref => this.chart = ref} */
            />
            <GaugeChart id="RAMGauge" value={ramUsagePer(data[9],currentRamCap)} title="RAM Gauge" />

        </div>
    );
}

export default RamUsageChart;
