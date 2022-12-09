import React, { useState, useEffect } from 'react'
import {FilterFilled} from '@ant-design/icons'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import {CancelOutlined} from '@mui/icons-material'
import {Button, Checkbox, Col, Row, Table} from 'antd'
import {Button as MUIButton, IconButton, TextField} from '@mui/material'
import styles from '../styles/Classes.module.css'

export default function Classes(){
    const [categoriesFilter, setCategoriesFilter] = useState({
        categories: ["addition", "subtraction", "multiplication", "division"],
        modes: ["lonely", "together", "as_part"]
    })

    const [newClassName, setNewClassName] = useState('')

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

    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            class: '1А',
            class_id: '123',
            pupil_count: 25,
            homework: '1. Сложение 24; 2. Умножение 13; 3. Вычитание 30;',
            deadline: '23.01.2023 00:00:00',
            completed_homework_count: 23,
            attempts_total: 1000,
            correct_answers: 850
        },{
            key: '2',
            class: '1Б',
            class_id: '222',
            pupil_count: 30,
            homework: '1. Умножение 5;',
            deadline: '20.01.2022 12:32:10',
            completed_homework_count: 21,
            attempts_total: 2132,
            correct_answers: 1349
        },
    ]);

    const columns = [
        {
            title: 'Класс',
            dataIndex: 'class',
            key: 'class',
            defaultSortOrder: 'descend',
            sorter: () => {},
            render: (text, record) => <a href={`classes/${record.class_id}`}>{text}</a>,
        },
        {
            title: 'Количество учеников',
            dataIndex: 'pupil_count',
            key: 'pupil_count',
            sorter: () => {}
        },
        {
            title: 'Домашнее задание',
            dataIndex: 'homework',
            key: 'homework',
            ...getColumnCategoriesFilterProps()
        },
        {
            title: 'Срок выполнения',
            dataIndex: 'deadline',
            key: 'deadline',
            sorter: () => {}
        },
        {
            title: 'Количество выполнивших',
            dataIndex: 'completed_homework_count',
            key: 'completed_homework_count',
            sorter: () => {}
        },
        {
            title: 'Всего ответов',
            dataIndex: 'attempts_total',
            key: 'attempts_total',
            sorter: () => {}
        },
        {
            title: 'Верных ответов',
            dataIndex: 'correct_answers',
            key: 'correct_answers',
            sorter: () => {}
        },
        {
          title: '',
          key: '',
          render: (_, record) => <a href={`classes/delete/${record.class_id}`}>
                                        <IconButton color="primary" aria-label="upload picture" component="label">
                                            <ClearOutlinedIcon style={{color: 'red', fontSize: 'medium'}}/>
                                        </IconButton>
                                    </a>,
        },
    ];

    const onchange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const handleAddClass = () => {
        let class_ = {
            key: dataSource.length + 1,
            class: newClassName,
            class_id: '555',
            pupil_count: 0,
            homework: '',
            deadline: '',
        }
        setDataSource([...dataSource, class_])
    }

    return (
    <>
        <Table dataSource={dataSource} columns={columns} pagination={false} onChange={onchange}/>
        <div className={styles.new_class}>
            <div className={styles.title}>Новый класс</div>
            <TextField style={{width: 360, height: 60}}
                    id="newClass"
                    label="Введите название класса"
                    type="text"
                    value={newClassName}
                    onChange={(event) => setNewClassName(event.target.value)}
                    InputProps={{
                            endAdornment: <IconButton key="name-clear-button"
                                                      onClick={() => setNewClassName('')}
                                                      edge="end">
                                                      <CancelOutlined />
                                        </IconButton>
            }}/>
            <MUIButton className={styles.main_button} onClick={handleAddClass}>Добавить класс</MUIButton>
        </div>
    </>  
    )
}