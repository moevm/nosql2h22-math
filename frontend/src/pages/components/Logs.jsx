import React, { useState, useEffect } from 'react'
import {SearchOutlined, FilterFilled} from '@ant-design/icons'
import {Input, Space,Button, Checkbox, Col, Row, DatePicker, Table} from 'antd'

export default function Logs(){
    const [dateFilter, setDateFilter] = useState(['', ''])
    const [levelsFilter, setLevelsFilter] = useState(["FINEST", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
    const [messageFilter, setMessageFilter] = useState('')

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

    const handleLevels = (list) => {
        setLevelsFilter(list)
    }

    const levelsReset = () => {
        setLevelsFilter(["FINEST", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
    }
    
    const getColumnLevelsFilterProps = () => ({
        filterDropdown: () => (
            <div style={{backgroundColor: '#FFFFFF !important'}}>
                <Checkbox.Group style={{margin: '4px'}} value={levelsFilter} onChange={handleLevels}>
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
                    <Button type="primary" style={{width: '100%', margin: 'auto'}}>
                        Apply
                    </Button>
                    <Button style={{width: '100%', margin: 'auto'}} onClick={levelsReset}>
                        Reset
                    </Button>
                </div>
            </div>
        ),
        filterIcon: () => (
            <FilterFilled style={{color: levelsFilter.length < 6 ? '#1890ff' : undefined}}/>
        ),
        onFilter: (value, record) => {},
        render: (text) =>
            text
    });

    const getContentSearchFilterProps = () => ({
        filterDropdown: () => (
            <div style={{padding: 8,}} onKeyDown={(e) => e.stopPropagation()}>
                <Input placeholder={'Введите часть сообщения'}
                       value={messageFilter}
                       onChange={(e) => setMessageFilter(e.target.value)}
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
                color: messageFilter.length > 0 ? '#1890ff' : undefined,
                }}
            />
            ),
            onFilter: (value, record) => {}
        });

    const dataSource = [
        {
            key: '1',
            end_timestamp: '09:11:03 2023-11-23',
            level: 'INFO',
            content: 'Здарова'
        },
        {
            key: '2',
            end_timestamp: '09:11:00 2023-11-23',
            level: 'WARNING',
            content: 'Досвидос 213 13 123 12 3123 13 123 123 '
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
            title: 'Уровень логирования',
            dataIndex: 'level',
            key: 'level',
            ...getColumnLevelsFilterProps()
        },
        {
            title: 'Сообщение',
            dataIndex: 'content',
            key: 'content',
            ...getContentSearchFilterProps()
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