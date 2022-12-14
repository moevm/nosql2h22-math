import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useParams } from "react-router-dom";
import {SearchOutlined, FilterFilled} from '@ant-design/icons';
import {Button, Checkbox, Col, Row, DatePicker, Table} from 'antd';
import nav_styles from '../styles/Navigation.module.css';

export default function PupilHistory(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    var {id} = useParams();

    const [displayData, setDisplayData] = useState({
        display: false,
        viewer_role: '',
        first_name: '',
        last_name: ''
    });

    useEffect(() => {
        const access = async () => {
            const user = await instance.get('/whoami');
            if (!user)
                return;
            if ((user.data._id == id)){
                setDisplayData({...displayData, display: true, viewer_role: "pupil"});
                return;
            };
            const result = await instance.get(`/access-to-user?requested=${id}`);
            if (result.data.status == 200)
                setDisplayData({...displayData, display: true,
                                                viewer_role: result.data.requesterRole,
                                                first_name: result.data.user.first_name,
                                                last_name: result.data.user.last_name
                });
        }
        access();
    }, []);

    const [dataSource, setDataSource] = useState([]);

    const [filter, setFilter] = useState({
        datetime: {
            start_datetime: null,
            end_datetime: null,
            sorter: "descend"
        },
        categories: {
            categories: ["addition", "subtraction", "multiplication", "division"],
            modes: ["single", "jointly", "as_part_of"],
        },
        solving_time_sorter: null,
        verdicts: ["correct", "not correct"]
    });

    const getColumnDateFilterProps = () => ({
        filterDropdown: () => (
            <DatePicker.RangePicker onChange={(date, dateString) => {
                                        var datetimeFilter = {...filter.datetime};
                                        datetimeFilter.start_datetime = (dateString[0] == '') ? null : dateString[0];
                                        datetimeFilter.end_datetime = (dateString[1] == '') ? null : dateString[1];
                                        setFilter({...filter, datetime: datetimeFilter});
                                    }}
                                    allowEmpty={[true, true]}
                                    showToday={true}/>
        ),
        filterIcon: () => (
            <SearchOutlined style={{color: ((filter.datetime.start_datetime) || (filter.datetime.end_datetime)) ? '#1890ff' : undefined}}/>
        )
    });

    const responseToDataSource = (attemptsArray) => {
        var i = 0;
        var result = [];
        attemptsArray.map(attempt => {
            var solvingTimeInSecs = Date.parse(attempt.solvingTime) / 1000;
            var solvingTimeHours = Math.floor(solvingTimeInSecs / 3600);
            var solvingTimeMinutes = Math.floor((solvingTimeInSecs % 3600) / 60);
            var solvingTimeSeconds = (solvingTimeInSecs % 3600) % 60;

            result.push({
                key: i++,
                datetime: (new Date(attempt.datetime)).toGMTString().slice(5, -4),
                content: attempt.taskContent,
                categories: attempt.categories.join('; '),
                solving_time: `${solvingTimeHours > 10 ? solvingTimeHours : '0' + solvingTimeHours}:` +
                              `${solvingTimeMinutes > 10 ? solvingTimeMinutes : '0' + solvingTimeMinutes}:` +
                              `${solvingTimeSeconds > 10 ? solvingTimeSeconds : '0' + solvingTimeSeconds}`,
                user_answer: attempt.answer,
                verdict: attempt.verdict ? "Верно" : "Не верно"
            });
        });
        setDataSource(result);
    };

    useEffect(() => {instance.get("/personal/attempts")
                             .then(res => responseToDataSource(res.data))}, [filter]);

    const handleCategories = (prop) => (list) => {
        var categoriesFilter = {...filter.categories};
        categoriesFilter[prop] = list;
        setFilter({...filter, categories: categoriesFilter});
    };

    const categoriesReset = () => {
        setFilter({...filter, categories: {categories: ["addition", "subtraction", "multiplication", "division"],
                                           modes: ["single", "jointly", "as_part_of"]}
        });
    };
    
    const getColumnCategoriesFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={filter.categories.categories} onChange={handleCategories('categories')}>
                    <Col>
                        <Row>
                            <Checkbox value="addition">Сложение</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="subtraction">Вычитание</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="multiplication">Умножение</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="division">Деление</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <Checkbox.Group style={{margin: '4px'}} value={filter.categories.modes} onChange={handleCategories('modes')}>
                    <Col>
                        <Row>
                            <Checkbox value="single">Одиночные</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="jointly">Совместно</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="as_part_of">В составе</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <div style={{display: 'flex'}}>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={categoriesReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: (filter.categories.categories.length + filter.categories.modes.length) < 7 ? '#1890ff' : undefined}}/>
        )
    });

    const handleVerdicts = (list) => {
        setFilter({...filter, verdicts: list});
    };

    const verdictsReset = () => {
        setFilter({...filter, verdicts: ["correct", "not correct"]});
    };

    const getColumnResultFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={filter.verdicts} onChange={handleVerdicts}>
                    <Col>
                        <Row>
                            <Checkbox value="correct">Верно</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="not correct">Не верно</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <div style={{display: 'flex'}}>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={verdictsReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: filter.verdicts.length < 2 ? '#1890ff' : undefined}}/>
        )
    });

    const columns = [
        {
            title: 'Дата',
            dataIndex: 'datetime',
            key: 'date',
            ...getColumnDateFilterProps(),
            defaultSortOrder: 'descend',
            sorter: () => {},
        },
        {
            title: 'Задача',
            dataIndex: 'content',
            key: 'task',
        },
        {
            title: 'Типы задачи',
            dataIndex: 'categories',
            key: 'categories',
            ...getColumnCategoriesFilterProps()
        },
        {
            title: 'Время ответа',
            dataIndex: 'solving_time',
            key: 'solving_time',
            sorter: () => {}
        },
        {
            title: 'Ответ',
            dataIndex: 'user_answer',
            key: 'answer',
        },
        {
            title: 'Результат',
            dataIndex: 'verdict',
            key: 'result',
            ...getColumnResultFilterProps()
        }
    ];

    const handleChangeSort = (pagination, filters, sorter, extra) => {
        var filterNew = {...filter};
        switch (sorter.field){
            case 'datetime':
                filterNew.datetime.sorter = (sorter.order == undefined) ? null : sorter.order;
                filterNew.solving_time_sorter = null;
                setFilter(filterNew);
                break;
            case 'solving_time':
                filterNew.solving_time_sorter = (sorter.order == undefined) ? null : sorter.order;
                filterNew.datetime.sorter = null;
                setFilter(filterNew);
                break;
            default:
                break;
        };
    };

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
                <Table dataSource={dataSource} columns={columns} pagination={false} onChange={handleChangeSort}/>
            </> : <div>You can't access to this information</div>
        }
    </>  
    )
}