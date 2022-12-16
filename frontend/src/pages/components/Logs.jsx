import React, {useState, useEffect} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {useLocation, useNavigate} from "react-router-dom";
import {SearchOutlined, FilterFilled} from '@ant-design/icons';
import {Input, Space,Button, Checkbox, Col, Row, DatePicker, Table} from 'antd';

export default function Logs(){
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
        levels: ["FINEST", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        content_search: '',
        page: 1,
        limit: 10
    });

    useEffect(() => {
        const access = async () => {
            const user = await instance.get('/whoami');
            if (!user.data)
                return;
            if (user.data.role == 'administrator'){
                setDisplay(true);
                return;
            };
        };
        access();
        var filterNew = {...filter};
        filterNew.page = query.get('page') == null ? 1 : Number(query.get('page'));
        filterNew.start_datetime = query.get('start_datetime') == null ? '' : query.get('start_datetime');
        filterNew.end_datetime = query.get('end_datetime') == null ? '' : query.get('end_datetime');
        filterNew.levels = query.get('levels') == null ? ["FINEST", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] : query.get('levels').split(',');
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
                                        setFilter(datetimeFilter);
                                    }}
                                    defaultValue={[filter.start_datetime == '' ? '' : dayjs(filter.start_datetime, 'YYYY-MM-DD'),
                                                filter.end_datetime == '' ? '' : dayjs(filter.end_datetime, 'YYYY-MM-DD')]}/>
        ),
        filterIcon: () => (
            <SearchOutlined style={{color: ((filter.start_datetime != '') || (filter.end_datetime != '')) ? '#1890ff' : undefined}}/>
        )
    });

    const handleLevels = (list) => {
        setFilter({...filter, levels: list});
    };

    const levelsReset = () => {
        setFilter({...filter, levels: ["FINEST", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]});
    };
    
    const getColumnLevelsFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={filter.levels} onChange={handleLevels}>
                    <Col>
                        <Row>
                            <Checkbox value="FINEST">FINEST</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="DEBUG">DEBUG</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="INFO">INFO</Checkbox>
                        </Row>
                    </Col>
                    <Col>
                        <Row>
                            <Checkbox value="WARNING">WARNING</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="ERROR">ERROR</Checkbox>
                        </Row>
                        <Row>
                            <Checkbox value="CRITICAL">CRITICAL</Checkbox>
                        </Row>
                    </Col>
                </Checkbox.Group>
                <div style={{display: 'flex'}}>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={levelsReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: filter.levels.length < 6 ? '#1890ff' : undefined}}/>
        )
    });

    const getContentSearchFilterProps = () => ({
        filterDropdown: () => (
            <div style={{padding: 8,}} onKeyDown={(e) => e.stopPropagation()}>
                <Input placeholder={'Введите часть сообщения'}
                       value={filter.content_search}
                       onChange={(e) => setFilter({...filter, content_search: e.target.value})}
                       style={{marginBottom: 8, display: 'block'}}/>
                <Space>
                <Button onClick={() => setFilter({...filter, content_search: ''})}
                    size="small"
                    style={{width: 90}}>Reset</Button>
                </Space>
            </div>
            ),
        filterIcon: () => (
            <SearchOutlined
                style={{
                color: filter.content_search.length > 0 ? '#1890ff' : undefined,
                }}
            />
        )
    });

    const responseToDataSource = (response) => {
        var i = 0;
        var result = [];
        var logsArray = response.logs;
        setTotalElements(response.totalElements);
        logsArray.map(record => {
            result.push({
                key: i++,
                timestamp: (new Date(record.timestamp)).toGMTString().slice(5, -4),
                level: record.level,
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
            query.set('levels', filter.levels);
            query.set('content_search', filter.content_search);
            navigate('?' + query.toString());
            instance.get(`/logs?${query.toString()}&limit=${filter.limit}&datetime_sorter=${filter.datetime_sorter}`)
                    .then(res => {
                        if (res.data.status == 200)
                            responseToDataSource(res.data);
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
            fixed: 'left',
            width: 200,
        },
        {
            title: 'Уровень логирования',
            dataIndex: 'level',
            key: 'level',
            fixed: 'left',
            width: 200,
            ...getColumnLevelsFilterProps()
        },
        {
            title: 'Сообщение',
            dataIndex: 'content',
            key: 'content',
            ...getContentSearchFilterProps()
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
                    <Table dataSource={dataSource} columns={columns}  scroll={{ x: 1500, y: 700 }} pagination={{position: 'topRight', total: totalElements, showQuickJumper: true}} onChange={handleChangeFilters} /> :
                    <div>You can't access to this information</div>
            }
        </>
    )
}