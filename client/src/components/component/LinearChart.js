import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const data = new Array(10).fill(0);
let currentRamCap = 1;

function LinearChart(props) {
    const [chartData, setChartData] = useState({
        series: [
            {
                name: 'RAM Usage %',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
        ],
        options: {
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false,
                },
                animations: {
                    enabled: false
                },
                background: '#10212d'
            },
            colors: ['#ffa600'],
            dataLabels: {
                enabled: false,
            },
            annotations: {
                // array of annotation objects
                xaxis: [
                    {
                        x: '0s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '2s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '4s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '6s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '8s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '10s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                    {
                        x: '12s',
                        borderColor: '#888',
                        label: {
                            borderColor: '#888',
                            style: {
                                color: '#fff',
                                background: '#888'
                            },
                        }
                    },
                ]
            },
            stroke: {
                curve: 'straight',
            },
            title: {
                text: 'RAM Usage per second',
                align: 'left',
                style: {
                    color: '#ffffff'
                }
            },
            xaxis: {
                categories: ['0s', '2s', '4s', '6s', '8s', '10s', '12s', '14s', '16s', '18s'],
                labels: {
                    style: {
                        colors: '#FFFFFF' // set the text color to white
                    }
                },
            },
            yaxis: {
                min: 0,
                max: 100,
                labels: {
                    style: {
                        colors: '#FFFFFF' // set the text color to white
                    }
                },
            }
        },
    });

    function ramUsagePer(used, total) {
        if (used.used) {
            return Math.round((parseInt(used.used) * 1000) / parseInt(total)) / 10;
        } else return null;
    }

    async function fetchRamUsage() {
        const connectionData = {
            user: props.userId,
            server: props.serverId,
        };
        try {
            const response = await axios.post('/api/servers/RAMUsage/', connectionData);
            currentRamCap = response.data.total;
            data.shift();
            data.push(response.data);
            setChartData((prevState) => ({
                ...prevState,
                series: [
                    {
                        name: 'RAM',
                        data: [
                            ramUsagePer(data[9], currentRamCap),
                            ramUsagePer(data[8], currentRamCap),
                            ramUsagePer(data[7], currentRamCap),
                            ramUsagePer(data[6], currentRamCap),
                            ramUsagePer(data[5], currentRamCap),
                            ramUsagePer(data[4], currentRamCap),
                            ramUsagePer(data[3], currentRamCap),
                            ramUsagePer(data[2], currentRamCap),
                            ramUsagePer(data[1], currentRamCap),
                            ramUsagePer(data[0], currentRamCap),
                        ],
                    },
                ],
            }));
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchRamUsage();
        }, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div id="chart">
            <ReactApexChart
                options={chartData.options}
                series={chartData.series}
                type="line"
                height={chartData.options.chart.height}
            />
        </div>
    );
}

export default LinearChart;
