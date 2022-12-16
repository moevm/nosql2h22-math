import React, {useState, useEffect} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {useLocation, useNavigate} from "react-router-dom";
import {SearchOutlined, FilterFilled} from '@ant-design/icons';
import {Input, Space,Button, Checkbox, Col, Row, DatePicker, Table} from 'antd';

export default function History(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);

    const [display, setDisplay] = useState(false);

    const [totalElements, setTotalElements] = useState(0);

    const [dataSource, setDataSource] = useState([]);

    const [filter, setFilter] = useState({
        start_datetime: '',
        end_datetime: '',
        datetime_sorter: "descend",
        roles: ["pupil", "teacher"],
        login_search: '',
        action_search: '',
        content_search: '',
        page: 1,
        limit: 10
    })

    useEffect(() => {
        const access = async () => {
            const user = await instance.get('/whoami');
            if (!user.data)
                return;
            if (user.data.role == 'administrator'){
                setDisplay(true);
                return;
            };
        }
        access();
        var filterNew = {...filter};
        filterNew.page = query.get('page') == null ? 1 : Number(query.get('page'));
        filterNew.start_datetime = query.get('start_datetime') == null ? '' : query.get('start_datetime');
        filterNew.end_datetime = query.get('end_datetime') == null ? '' : query.get('end_datetime');
        filterNew.roles = query.get('roles') == null ? ["pupil", "teacher"] : query.get('roles').split(',');
        filterNew.login_search = query.get('login_search') == null ? '' : query.get('login_search');
        filterNew.action_search = query.get('action_search') == null ? '' : query.get('action_search');
        filterNew.content_search = query.get('content_search') == null ? '' : query.get('content_search');
        setFilter(filterNew);
    }, []);

    const getColumnDateFilterProps = () => ({
        filterDropdown: () => (
            <DatePicker.RangePicker allowEmpty={[true, true]} showToday={true}
                                    onChange={(date, dateString) => {
                                        var datetimeFilter = {...filter};
                                        datetimeFilter.start_datetime = dateString[0];
                                        datetimeFilter.end_datetime = dateString[1];
                                        setFilter(datetimeFilter)
                                        }
                                    }
                                    defaultValue={[filter.start_datetime == '' ? '' : dayjs(filter.start_datetime, 'YYYY-MM-DD'),
                                                filter.end_datetime == '' ? '' : dayjs(filter.end_datetime, 'YYYY-MM-DD')]}/>
        ),
        filterIcon: () => (
            <SearchOutlined style={{color: ((filter.start_datetime != '') || (filter.end_datetime != '')) ? '#1890ff' : undefined}}/>
        )
    });

    const handleSearch = (prop) => (e) => {
        setFilter({...filter, [prop]: e.target.value});
    };

    const handleRoles = (list) => {
        setFilter({...filter, roles: list});
    };

    const rolesReset = () => {
        setFilter({...filter, roles: ["pupil", "teacher"]});
    };
    
    const getColumnRolesFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={filter.roles} onChange={handleRoles}>
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
                    <Button style={{width: '100%', margin: 'auto'}} onClick={rolesReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: filter.roles.length < 2 ? '#1890ff' : undefined}}/>
        )
    });

    const getContentSearchFilterProps = (prop) => ({
        filterDropdown: () => (
            <div style={{padding: 8,}} onKeyDown={(e) => e.stopPropagation()}>
                <Input placeholder={'Введите часть сообщения'}
                       value={filter[prop]}
                       onChange={handleSearch(prop)}
                       onPressEnter={() => {}}
                       style={{marginBottom: 8, display: 'block',}}/>
                <Space>
                <Button onClick={() => setFilter({...filter, [prop]: ''})}
                    size="small"
                    style={{width: 90}}>Reset</Button>
                </Space>
            </div>
            ),
        filterIcon: () => (
            <SearchOutlined
                style={{
                color: filter[prop].length > 0 ? '#1890ff' : undefined,
                }}
            />
        )
    });

    const responseToDataSource = (response) => {
        var i = 0;
        var result = [];
        var historyArray = response.history;
        setTotalElements(response.totalElements);
        historyArray.map(record => {
            result.push({
                key: i++,
                timestamp: (new Date(record.timestamp)).toGMTString().slice(5, -4),
                login: record.login,
                role: record.role,
                action: record.action,
                content: record.content
            });
        });
        setDataSource(result);
    };

    useEffect(() => {
        if (display){
            query.set('page', filter.page);
            query.set('start_datetime', filter.start_datetime);
            query.set('end_datetime', filter.end_datetime);
            query.set('roles', filter.roles);
            query.set('login_search', filter.login_search);
            query.set('action_search', filter.action_search);
            query.set('content_search', filter.content_search);
            navigate('?' + query.toString());
            instance.get(`/history?${query.toString()}&limit=${filter.limit}&datetime_sorter=${filter.datetime_sorter}`)
                    .then(res => {
                        console.log(res.data)
                        if (res.data.status == 200)
                            responseToDataSource(res.data)
                    });
            
        }}, [filter, display]);

    const columns = [
        {
            title: 'Дата',
            dataIndex: 'timestamp',
            key: 'date',
            ...getColumnDateFilterProps(),
            defaultSortOrder: 'descend',
            sorter: () => {},
        },
        {
            title: 'Логин',
            dataIndex: 'login',
            key: 'login',
            ...getContentSearchFilterProps('login_search')
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
            ...getContentSearchFilterProps('action_search')
        },
        {
            title: 'Сообщение',
            dataIndex: 'content',
            key: 'content',
            ...getContentSearchFilterProps('content_search')
        }
    ];

    const handleChangeFilters = (pagination, filters, sorter, extra) => {
        var filterNew = {...filter};
        filterNew.page = pagination.current;
        filterNew.limit = pagination.pageSize;
        switch (sorter.field){
            case 'timestamp':
                filterNew.datetime_sorter = (sorter.order == undefined) ? '' : sorter.order;
            default:
                break;
        };
        setFilter(filterNew);
    };

    return (
    <>
        {
            display ?
                <Table dataSource={dataSource} columns={columns} pagination={{total: totalElements, showQuickJumper: true}} onChange={handleChangeFilters} /> :
                <div>You can't access to this information</div>
        }
    </>  
    )
}