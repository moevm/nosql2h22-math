import React from 'react'
import { NavLink } from "react-router-dom"
import {DatePicker} from 'antd'
import Chart from 'react-apexcharts'
import styles from '../styles/Stats.module.css'
import nav_styles from '../styles/Navigation.module.css'

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

    let i = 0
    let role = "teacher"
    let homeworks_history_response = [
        {deadline_timestamp: "11 января 2023",
         status: 'in progress',
         tasks: [{categories: ['сложение', 'умножение'],
                  count: 10,
                  progress: 9},
                 {categories: ['вычитание', 'умножение', 'деление'],
                  count: 5,
                  progress: 5},
                 {categories: ['сложение'],
                  count: 15,
                  progress: 3}]},
        {deadline_timestamp: "13 января 2020",
         status: 'failed',
         tasks: [{categories: ['сложение'],
                  count: 30,
                  progress: 21},
                 {categories: ['вычитание', 'деление'],
                  count: 5,
                  progress: 3}]},
        {deadline_timestamp: "15 января 2019",
         status: 'completed',
         tasks: [{categories: ['сложение', 'вычитание', 'умножение', 'деление'],
                  count: 10,
                  progress: 10}]}
    ]

    let homeworks = <div>
                        {homeworks_history_response.map(homework => (
                        <div key={i++} className={styles.homework}
                                       style={(homework.status == 'completed') ?
                                                {border: '2px dashed #3FB017'} :
                                                ((homework.status == 'failed') ?
                                                    {border: '2px dashed #FF4D4F'} :
                                                    {border: '2px dashed rgba(227, 114, 34, 0.8)'})}>
                            <div className={styles.title}>
                                <div>Домашнее задание</div>
                                <div>До {homework.deadline_timestamp}</div>
                            </div>
                            <ol>
                                {homework.tasks.map(task =>
                                    <li key={i++}>{task.categories.join(' и ') + ' - ' + task.progress + '/' + task.count}</li>
                                )}
                            </ol>
                        </div>
                        ))}
                    </div>

    let activeStyle = {
        color: "#07889B"
    };

    let teacher_navigation = <></>
    if (role == "teacher")
        teacher_navigation = <div className={nav_styles.navbar}>
            <div className={nav_styles.center}>
                <div>Имя Фамилия:</div>
                <NavLink
                    to="/stats"
                    style={({ isActive }) =>
                    isActive ? activeStyle : undefined
                    }>Статистика</NavLink>
                <NavLink
                    to="/user_history"
                    style={({ isActive }) =>
                    isActive ? activeStyle : undefined
                    }>История</NavLink>
            </div>
        </div>

    return (
        <>
            {teacher_navigation}
            <div className={styles.main}>
                <div className={styles.graph}>
                    <Chart options={state.options} series={state.series} type="bar" width={750} height={300}/>
                    <DatePicker.RangePicker showToday={true} allowEmpty={[true, true]}/>
                </div>
                <div className={styles.homeworks_content}>
                    <div style={{textAlign: 'center', marginBottom: '10px'}}>Прогресс домашнего задания</div>
                    {homeworks}
                </div>
            </div>
        </>
    )
}