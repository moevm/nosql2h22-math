import React, { useState, useEffect } from 'react'
import { NavLink } from "react-router-dom"
import {SearchOutlined, FilterFilled} from '@ant-design/icons'
import {Button, Checkbox, Col, Row, DatePicker, Table} from 'antd'
import nav_styles from '../styles/Navigation.module.css'

export default function PupilHistory(){
    const [dateFilter, setDateFilter] = useState(['', ''])
    const [categoriesFilter, setCategoriesFilter] = useState({
        categories: ["addition", "subtraction", "multiplication", "division"],
        modes: ["lonely", "together", "as_part"]
    })
    const [resultsFilter, setResultsFilter] = useState(["correct", "not correct"])

    const getColumnDateFilterProps = () => ({
        filterDropdown: () => (
            <DatePicker.RangePicker onChange={(date, dateString) => {setDateFilter(dateString)}}
                                    allowEmpty={[true, true]}
                                    showToday={true}/>
        ),
        filterIcon: () => (
            <SearchOutlined style={{color: (dateFilter[0].length > 0 || dateFilter[1].length > 0) ? '#1890ff' : undefined}}/>
        ),
        onFilter: (value, record) => {},
        render: (text) =>
            text
    });

    const handleCategories = (prop) => (list) => {
        setCategoriesFilter({...categoriesFilter, [prop]: list})
    }

    const categoriesReset = () => {
        setCategoriesFilter({...categoriesFilter, categories: ["addition", "subtraction", "multiplication", "division"],
                                                  modes: ["lonely", "together", "as_part"]})
    }
    
    const getColumnCategoriesFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={categoriesFilter.categories} onChange={handleCategories('categories')}>
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
                <Checkbox.Group style={{margin: '4px'}} value={categoriesFilter.modes} onChange={handleCategories('modes')}>
                    <Col>
                        <Row>
                            <Checkbox value="lonely">Одиночные</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="together">Совместно</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="as_part">В составе</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <div style={{display: 'flex'}}>
                    <Button type="primary" style={{width: '100%', margin: 'auto'}}>
                        Apply
                    </Button>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={categoriesReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: (categoriesFilter.categories.length + categoriesFilter.modes.length) < 7 ? '#1890ff' : undefined}}/>
        ),
        onFilter: (value, record) => {},
        render: (text) =>
            text
    });

    const handleResults = (list) => {
        setResultsFilter(list)
    }

    const resultsReset = () => {
        setResultsFilter(["correct", "not correct"])
    }

    const getColumnResultFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={resultsFilter} onChange={handleResults}>
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
                    <Button type="primary" style={{width: '100%', margin: 'auto'}}>
                        Apply
                    </Button>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={resultsReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: (categoriesFilter.categories.length + categoriesFilter.modes.length) < 7 ? '#1890ff' : undefined}}/>
        ),
        onFilter: (value, record) => {},
        render: (text) =>
            text
    })

    const dataSource = [
        {
            key: '1',
            end_timestamp: '09:11:03 2023-11-23',
            content: '23x17-13',
            categories: ['subtraction', 'multiplication'].join('; '),
            time_spent: '00:01:12',
            user_answer: '15',
            status: 'not correct'
        },
        {
            key: '2',
            end_timestamp: '09:09:03 2023-11-23',
            content: '10+5',
            categories: ['addition'].join('; '),
            time_spent: '00:00:17',
            user_answer: '15',
            status: 'correct'
        },
        {
            key: '3',
            end_timestamp: '09:08:15 2023-11-23',
            content: '10x7+31',
            categories: ['addition', 'multiplication'].join('; '),
            time_spent: '00:02:01',
            user_answer: '101',
            status: 'correct'
        },
        {
            key: '4',
            end_timestamp: '09:05:32 2023-11-23',
            content: '26+18/3',
            categories: ['addition', 'division'].join('; '),
            time_spent: '00:01:51',
            user_answer: '32',
            status: 'correct'
        },
        {
            key: '5',
            end_timestamp: '09:04:32 2023-11-23',
            content: '26+18/3',
            categories: ['addition', 'division'].join('; '),
            time_spent: '00:01:31',
            user_answer: '30',
            status: 'not correct'
        }
    ];

    const columns = [
        {
            title: 'Дата',
            dataIndex: 'end_timestamp',
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
            dataIndex: 'time_spent',
            key: 'time_spent',
            sorter: () => {}
        },
        {
            title: 'Ответ',
            dataIndex: 'user_answer',
            key: 'answer',
        },
        {
            title: 'Результат',
            dataIndex: 'status',
            key: 'result',
            ...getColumnResultFilterProps()
        }
    ];

    const onchange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    let activeStyle = {
        color: "#07889B"
    };

    let role = "teacher"

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
        <Table dataSource={dataSource} columns={columns} pagination={false} onChange={onchange}/>
    </>  
    )
}