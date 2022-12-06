import React, { useState, useEffect } from 'react'
import {DatePicker, Switch, Space} from 'antd'
import {IconButton, TextField} from '@mui/material'
import {CancelOutlined} from '@mui/icons-material'
import Chart from 'react-apexcharts'
import styles from '../styles/Stats.module.css'

export default function Stats(){
    let state = { 
        series: [{
            name: 'Верно',
            data: [44, 55, 41, 37]
        }, {
            name: 'Неверно',
            data: [53, 32, 33, 52]
        }],
        options: {
            chart: {
                type: 'bar',
                stacked: true,
                background: '#F5F0F6',
                fontFamily: 'Roboto',
                toolbar: {
                    show: false,
                },
            },
            colors: ['#01E396', '#FF4560'],
            grid: {
                show: false
            },
            dataLabels: {
                style: {
                    fontSize: '18px',
                }
            },
            xaxis: {
                categories: ['Сложение', 'Вычитание', 'Умножение', 'Деление'],
                labels: {
                    style: {
                        fontSize: '14px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '16px'
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '90%',
                    dataLabels: {
                        total: {
                            enabled: true,
                            offsetX: 0,
                            style: {
                                fontSize: '18px'
                            }
                        }
                    }
                },
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            tooltip: {
                y: {formatter: (seriesName) => seriesName}
            },
            fill: {
                opacity: 1
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                offsetY: 20,
                fontFamily: 'Roboto',
                fontSize: 18
            }
        },
    };

    return (
        <>
            <div className={styles.graph}>
                <Chart options={state.options} series={state.series} type="bar" width={750} height={300}/>
                <DatePicker.RangePicker />
            </div>
            <div className={styles.homeworks}>

            </div>
        </>
    )
}