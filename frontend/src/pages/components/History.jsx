import React, { useState, useEffect } from 'react'
import {SearchOutlined, FilterFilled} from '@ant-design/icons'
import {Input, Space,Button, Checkbox, Col, Row, DatePicker, Table} from 'antd'

export default function History(){
    const [dateFilter, setDateFilter] = useState(['', ''])
    const [rolesFilter, setRolesFilter] = useState(["pupil", "teacher"])
    const [searchFilter, setSearchFilter] = useState({
        login: '',
        action: '',
        content: ''
    })

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

    const handleSearch = (prop) => (e) => {
        console.log(prop)
        console.log(e.target.value)
        setSearchFilter({...searchFilter, [prop]: e.target.value})
    }

    const handleRoles = (list) => {
        setRolesFilter(list)
    }

    const rolesReset = () => {
        setRolesFilter(["pupil", "teacher"])
    }
    
    const getColumnRolesFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={rolesFilter} onChange={handleRoles}>
                    <Col>
                        <Row>
                            <Checkbox value="pupil">Ученик</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="teacher">Учитель</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <div style={{display: 'flex'}}>
                    <Button type="primary" style={{width: '100%', margin: 'auto'}}>
                        Apply
                    </Button>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={rolesReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: rolesFilter.length < 2 ? '#1890ff' : undefined}}/>
        ),
        onFilter: (value, record) => {},
        render: (text) =>
            text
    });

    const getContentSearchFilterProps = (prop) => ({
        filterDropdown: () => (
            <div style={{padding: 8,}} onKeyDown={(e) => e.stopPropagation()}>
                <Input placeholder={'Введите часть сообщения'}
                       value={searchFilter[prop]}
                       onChange={handleSearch(prop)}
                       onPressEnter={() => {}}
                       style={{marginBottom: 8, display: 'block',}}/>
                <Space>
                <Button type="primary"
                        onClick={() => {}}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{width: 90}}>Apply</Button>
                <Button onClick={() => setMessageFilter('')}
                    size="small"
                    style={{width: 90}}>Reset</Button>
                </Space>
            </div>
            ),
            filterIcon: () => (
            <SearchOutlined
                style={{
                color: searchFilter[prop].length > 0 ? '#1890ff' : undefined,
                }}
            />
            ),
            onFilter: (value, record) => {}
        });

    const dataSource = [
        {
            key: '1',
            end_timestamp: '09:11:03 2023-11-23',
            login: 'asdasd@gmail.com',
            role: 'Ученик',
            action: 'Передвижение мыши',
            content: 'Мышь перемешена в координаты 1233 213'
        },{
            key: '2',
            end_timestamp: '09:11:03 2023-11-23',
            login: 'asdas321d@gmail.com',
            role: 'Ученик',
            action: 'Редактирование ответа',
            content: 'Изменение ответа с "13" на "22"'
        },{
            key: '3',
            end_timestamp: '09:11:03 2023-11-23',
            login: 'asda22sd@gmail.com',
            role: 'Учитель',
            action: 'Создание класса',
            content: 'Создан класс "1А"'
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
            title: 'Логин',
            dataIndex: 'login',
            key: 'login',
            ...getContentSearchFilterProps('login')
        },
        {
            title: 'Тип пользователя',
            dataIndex: 'role',
            key: 'role',
            ...getColumnRolesFilterProps()
        },
        {
            title: 'Действие',
            dataIndex: 'action',
            key: 'action',
            ...getContentSearchFilterProps('action')
        },
        {
            title: 'Сообщение',
            dataIndex: 'content',
            key: 'content',
            ...getContentSearchFilterProps('content')
        }
    ];

    const onchange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    return (
    <>
        <Table dataSource={dataSource} columns={columns} pagination={false} onChange={onchange}/>
    </>  
    )
}