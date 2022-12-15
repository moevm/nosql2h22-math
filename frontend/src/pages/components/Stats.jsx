import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {NavLink, useParams, useLocation, useNavigate } from "react-router-dom"
import {DatePicker} from 'antd'
import Chart from 'react-apexcharts'
import styles from '../styles/Stats.module.css'
import nav_styles from '../styles/Navigation.module.css'

export default function Stats(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    var {id} = useParams();

    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);

    const [displayData, setDisplayData] = useState({
        display: false,
        viewer_role: '',
        first_name: '',
        last_name: ''
    });

    const [series, setSeries] = useState({
        correct: [0, 0, 0, 0],
        not_correct: [0, 0, 0, 0]
    })

    const [filter, setFilter] = useState({
        start_datetime: '',
        end_datetime: ''
    })

    useEffect(() => {
        const access = async () => {
            const user = await instance.get('/whoami');
            if (!user.data)
                return;
            if (user.data._id == id){
                setDisplayData({...displayData, display: true, viewer_role: "pupil"});
                return;
            };
            const result = await instance.get(`/access-to-user?requested=${id}`);
            if (result.data.status == 200)
                setDisplayData({...displayData, display: true,
                                                viewer_role: result.data.requesterRole,
                                                first_name: result.data.user.first_name,
                                                last_name: result.data.user.last_name});
        };
        access();
        var filterNew = {...filter};
        filterNew.start_datetime = query.get('start_datetime') == null ? '' : query.get('start_datetime');
        filterNew.end_datetime = query.get('end_datetime') == null ? '' : query.get('end_datetime');
        setFilter(filterNew);
    }, []);

    useEffect(() => {
        if (displayData.display){
            query.set('start_datetime', filter.start_datetime);
            query.set('end_datetime', filter.end_datetime);
            navigate('?' + query.toString());
            instance.get(`/personal/graph-stats?userId=${id}&${query.toString()}`).then(res => {
                if (res.data.status == 200)
                    setSeries(res.data.series);
            });
        }
    }, [displayData, filter])

    let state = { 
        series: [{
            name: 'Верно',
            data: series.correct
        }, {
            name: 'Неверно',
            data: series.not_correct
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

    let i = 0;

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

    const getSubNavigation = () => {
        var activeStyle = {
            color: "#07889B"
        };
        return <div className={nav_styles.navbar}>
                   <div className={nav_styles.center}>
                       <div>{`${displayData.first_name} ${displayData.last_name}`}:</div>
                       <NavLink
                           to={"/stats/" + id}
                           style={({ isActive }) =>
                           isActive ? activeStyle : undefined
                           }>Статистика</NavLink>
                       <NavLink
                           to={"/user_history/" + id}
                           style={({ isActive }) =>
                           isActive ? activeStyle : undefined
                           }>История</NavLink>
                   </div>
               </div>
    };

    return (
        <>
            {
                displayData.display ? <>
                    {(displayData.viewer_role !== "pupil") ? getSubNavigation() : <div style={{marginTop: "50px"}}></div>}
                    <div className={styles.main}>
                        <div className={styles.graph}>
                            <Chart options={state.options} series={state.series} type="bar" width={750} height={300}/>
                            <DatePicker.RangePicker showToday={true} allowEmpty={[true, true]} onChange={(date, dateString) => {
                                        var datetimeFilter = {...filter};
                                        datetimeFilter.start_datetime = dateString[0];
                                        datetimeFilter.end_datetime = dateString[1];
                                        setFilter(datetimeFilter)
                                    }
                                }
                                defaultValue={[filter.start_datetime == '' ? '' : dayjs(filter.start_datetime, 'YYYY-MM-DD'),
                                               filter.end_datetime == '' ? '' : dayjs(filter.end_datetime, 'YYYY-MM-DD')]}/>
                        </div>
                        {/*
                        <div className={styles.homeworks_content}>
                            <div style={{textAlign: 'center', marginBottom: '10px'}}>Прогресс домашнего задания</div>
                            {homeworks}
                            </div> */}
                    </div>
                </> : <div>You can't access to this information</div>
            }
        </>
    )
}