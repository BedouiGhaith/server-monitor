import React from 'react';

function overviewTable(props) {
    const { data } = props;
    const tStyle ={
        padding: "15px",
        backgroundColor: "#55608f",
        color:"#fff",
    }

    return (
        <table style={{height:"40%", width:"auto",marginInline:"100px"}} >
            <thead>
            </thead>
            <tbody >
                <tr>
                    <th style={tStyle}>CPU</th>
                    <td style={tStyle}>{(parseFloat(data.cpu.sy) + parseFloat(data.cpu.us)).toFixed(2)}</td>
                </tr>
                <tr>
                    <th style={tStyle}>RAM</th>
                    <td style={tStyle}>{data.mem.used} Bytes</td>
                </tr>
                <tr>
                    <th style={tStyle}>SWAP</th>
                    <td style={tStyle}>{parseFloat(data.swap.used)} Bytes</td></tr>
                <tr>
                    <th style={tStyle}>TASKS</th>
                    <td style={tStyle}>{data.tasks.total}</td>
                </tr>
                <tr>
                    <th style={tStyle} rowSpan="3">LOAD</th>
                    <td  style={tStyle}>
                        <table>
                            <tbody>
                                <tr>
                                    <td style={tStyle}>1MIN</td>
                                    <td style={tStyle}>{data.top.load_average[0]}</td>
                                </tr>
                                <tr>
                                    <td style={tStyle}>5MIN</td>
                                    <td style={tStyle}>{data.top.load_average[1]}</td>
                                </tr>
                                <tr>
                                    <td style={tStyle}>15MIN</td>
                                    <td style={tStyle}>{data.top.load_average[2]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export default overviewTable;