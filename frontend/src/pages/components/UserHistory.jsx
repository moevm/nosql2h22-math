import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { NavLink, useParams, useLocation, useNavigate } from "react-router-dom";
import {SearchOutlined, FilterFilled} from '@ant-design/icons';
import {Button, Checkbox, Col, Row, DatePicker, Table} from 'antd';
import nav_styles from '../styles/Navigation.module.css';

export default function PupilHistory(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    var {id} = useParams();

    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);

    const [totalElements, setTotalElements] = useState(0);

    const [displayData, setDisplayData] = useState({
        display: false,
        viewer_role: '',
        first_name: '',
        last_name: ''
    });

    const [dataSource, setDataSource] = useState([]);

    const [filter, setFilter] = useState({
        start_datetime: '',
        end_datetime: '',
        datetime_sorter: "descend",
        categories: ["addition", "subtraction", "multiplication", "division"],
        modes: ["single", "jointly", "as_part_of"],
        solving_time_sorter: '',
        verdicts: ["correct", "not correct"],
        page: 1,
        limit: 10
    });

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
        }
        access();
        var filterNew = {...filter};
        filterNew.page = query.get('page') == null ? 1 : Number(query.get('page'));
        filterNew.limit = query.get('limit') == null ? 10 : Number(query.get('limit'));
        filterNew.start_datetime = query.get('start_datetime') == null ? '' : query.get('start_datetime');
        filterNew.end_datetime = query.get('end_datetime') == null ? '' : query.get('end_datetime');
        filterNew.categories = query.get('categories') == null ? ["addition", "subtraction", "multiplication", "division"] : query.get('categories').split(',');
        filterNew.modes = query.get('modes') == null ? ["single", "jointly", "as_part_of"] : query.get('modes').split(',');
        filterNew.verdicts = query.get('verdicts') == null ? ["correct", "not correct"] : query.get('verdicts').split(',');
        setFilter(filterNew);
    }, []);

    const getColumnDateFilterProps = () => ({
        filterDropdown: () => (
            <DatePicker.RangePicker onChange={(date, dateString) => {
                                        var datetimeFilter = {...filter};
                                        datetimeFilter.start_datetime = dateString[0];
                                        datetimeFilter.end_datetime = dateString[1];
                                        setFilter(datetimeFilter);
                                    }}
                                    allowEmpty={[true, true]}
                                    showToday={true}
                                    defaultValue={[filter.start_datetime == '' ? '' : dayjs(filter.start_datetime, 'YYYY-MM-DD'),
                                                   filter.end_datetime == '' ? '' : dayjs(filter.end_datetime, 'YYYY-MM-DD')]}/>
        ),
        filterIcon: () => (
            <SearchOutlined style={{color: ((filter.start_datetime != '') || (filter.end_datetime != '')) ? '#1890ff' : undefined}}/>
        )
    });

    const responseToDataSource = (response) => {
        var i = 0;
        var result = [];
        var attemptsArray = response.attempts;
        setTotalElements(response.totalElements);
        attemptsArray.map(attempt => {
            var solvingTimeInSecs = Math.floor(attempt.solvingTime / 1000);
            var solvingTimeHours = Math.floor(solvingTimeInSecs / 3600);
            var solvingTimeMinutes = Math.floor((solvingTimeInSecs % 3600) / 60);
            var solvingTimeSeconds = (solvingTimeInSecs % 3600) % 60;

            result.push({
                key: i++,
                datetime: (new Date(attempt.datetime)).toGMTString().slice(5, -4),
                content: attempt.taskContent,
                categories: attempt.categories.join('; '),
                solving_time: `${solvingTimeHours > 9 ? solvingTimeHours : '0' + solvingTimeHours}:` +
                              `${solvingTimeMinutes > 9 ? solvingTimeMinutes : '0' + solvingTimeMinutes}:` +
                              `${solvingTimeSeconds > 9 ? solvingTimeSeconds : '0' + solvingTimeSeconds}`,
                user_answer: attempt.answer,
                verdict: (attempt.verdict == "correct") ? "Верно" : "Не верно"
            });
        });
        setDataSource(result);
    };

    useEffect(() => {
        if (displayData.display){
            query.set('page', filter.page);
            query.set('limit', filter.limit);
            query.set('start_datetime', filter.start_datetime);
            query.set('end_datetime', filter.end_datetime);
            query.set('categories', filter.categories);
            query.set('modes', filter.modes);
            query.set('verdicts', filter.verdicts);
            navigate('?' + query.toString());
            instance.get(`/personal/attempts?userId=${id}&${query.toString()}&datetime_sorter=${filter.datetime_sorter}&solving_time_sorter=${filter.solving_time_sorter}`)
                    .then(res => {
                        if (res.data.status == 200)
                            responseToDataSource(res.data)
                    });
            
        }}, [filter, displayData]);

    const handleCategories = (prop) => (list) => {
        var categoriesFilter = {...filter};
        categoriesFilter[prop] = list;
        setFilter(categoriesFilter);
    };

    const categoriesReset = () => {
        setFilter({...filter, categories: ["addition", "subtraction", "multiplication", "division"],
                              modes: ["single", "jointly", "as_part_of"]
        });
    };
    
    const getColumnCategoriesFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={filter.categories} onChange={handleCategories('categories')}>
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
                <Checkbox.Group style={{margin: '4px'}} value={filter.modes} onChange={handleCategories('modes')}>
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
            <FilterFilled style={{color: (filter.categories.length + filter.modes.length) < 7 ? '#1890ff' : undefined}}/>
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

    const handleChangeFilters = (pagination, filters, sorter, extra) => {
        var filterNew = {...filter};
        filterNew.page = pagination.current;
        filterNew.limit = pagination.pageSize;
        switch (sorter.field){
            case 'datetime':
                filterNew.datetime_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.solving_time_sorter = '';
                break;
            case 'solving_time':
                filterNew.solving_time_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.datetime_sorter = '';
                break;
            default:
                break;
        };
        setFilter(filterNew);
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
                <Table dataSource={dataSource} columns={columns} pagination={{total: totalElements, showQuickJumper: true}} onChange={handleChangeFilters} />
            </> : <div>You can't access to this information</div>
        }
    </>  
    )
}