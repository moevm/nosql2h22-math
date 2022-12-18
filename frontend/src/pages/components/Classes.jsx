import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {NavLink, useParams, useLocation, useNavigate} from "react-router-dom";
import {Button, Checkbox, Col, Row, Table} from 'antd';
import {FilterFilled} from '@ant-design/icons';
import {Button as MUIButton, IconButton, TextField} from '@mui/material';
import {CancelOutlined, ClearOutlined} from '@mui/icons-material';
import styles from '../styles/Classes.module.css';

export default function Classes(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    useEffect(() => {
        instance.post('/add_action', {action: 'Открытие страницы',
                                      content: `Открыта страница "Классы"`});
    }, []);

    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);

    const [totalElements, setTotalElements] = useState(5);

    const [newClassName, setNewClassName] = useState('');

    const [display, setDisplay] = useState(false);

    const [dataSource, setDataSource] = useState([]);

    const [filter, setFilter] = useState({
        class_sorter: "descend",
        pupils_count_sorter: "",
        categories: ["addition", "subtraction", "multiplication", "division"],
        modes: ["single", "jointly", "as_part_of"],
        deadline_sorter: "",
        completed_homeworks_sorter: "",
        submitted_answers_sorter: "",
        correct_answers_sorter: "",
        page: 1,
        limit: 10
    });

    useEffect(() => {
        const access = async () => {
            const user = await instance.get('/whoami');
            if (!user.data)
                return;
            if (user.data.role == "teacher"){
                setDisplay(true);
                return;
            };
        }
        access();
        var filterNew = {...filter};
        filterNew.page = query.get('page') == null ? 1 : Number(query.get('page'));
        filterNew.categories = query.get('categories') == null ? ["addition", "subtraction", "multiplication", "division"] : query.get('categories').split(',');
        filterNew.modes = query.get('modes') == null ? ["single", "jointly", "as_part_of"] : query.get('modes').split(',');
        setFilter(filterNew);
    }, []);

    
    const responseToDataSource = (response) => {
        var i = 0;
        var result = [];
        var classesArray = response.result;
        setTotalElements(response.totalElements);
        classesArray.map(record => {
            result.push({
                key: i++,
                class: record.title,
                class_id: record._id,
                pupil_count: record.pupilCount,
                homework: record.tasks ? record.tasks.map(res => `${res.categories.join(" и ")} - ${res.count}`).join('; ') : '',
                deadline: record.deadline ? `${record.deadline.substring(0, 10)} ${record.deadline.substring(11, 19)}` : '',
                completed_homework_count: record.doneCount,
                attempts_total: record.answersCount,
                correct_answers: record.correctAnswersCount
            });
        });
        setDataSource(result);
    };

    const updateTable = () => {
        query.set('page', filter.page);
        query.set('categories', filter.categories);
        query.set('modes', filter.modes);
        navigate('?' + query.toString());
        instance.get(`/classes?${query.toString()}&limit=${filter.limit}&pupils_count_sorter=${filter.pupils_count_sorter}&deadline_sorter=${filter.deadline_sorter}`+
                     `&completed_homeworks_sorter=${filter.completed_homeworks_sorter}&submitted_answers_sorter=${filter.submitted_answers_sorter}&correct_answers_sorter=${filter.correct_answers_sorter}`)
                .then(res => {
                    console.log(res.data)
                    if (res.data.status == 200)
                        responseToDataSource(res.data)
                });
    }

    useEffect(() => {
        if (display){
            updateTable();
        }}, [filter, display]);

    const handleCategories = (prop) => (list) => {
        setFilter({...filter, [prop]: list})
    }

    const categoriesReset = () => {
        setFilter({...filter, categories: ["addition", "subtraction", "multiplication", "division"],
                                                  modes: ["single", "jointly", "as_part_of"]})
    }
    
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

    const deleteClass = async(classId) => {
        await instance.post(`/classes/${classId}/delete`);
        instance.post('/add_action', {action: 'Удаление класса',
                                      content: `Удалён класс id = ${classId}`});
        updateTable();
    }

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
          key: 'x',
          onCell: (record, rowIndex) => {
            return {
                onClick: (ev) => {
                    deleteClass(record.class_id)
                },
            };
          },
          render: (_, record) => <IconButton color="primary" aria-label="upload picture" component="label">
                                    <ClearOutlined style={{color: 'red', fontSize: 'medium'}} />
                                 </IconButton>,
        },
    ];

    const handleChangeFilters = (pagination, filters, sorter, extra) => {
        var filterNew = {...filter};
        filterNew.page = pagination.current;
        filterNew.limit = pagination.pageSize;
        switch (sorter.field){
            case 'class':
                filterNew.class_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.pupils_count_sorter = '';
                filterNew.deadline_sorter = '';
                filterNew.completed_homeworks_sorter = '';
                filterNew.submitted_answers_sorter = '';
                filterNew.correct_answers_sorter = '';
                break;
            case 'pupil_count':
                filterNew.class_sorter = '';
                filterNew.pupils_count_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.deadline_sorter = '';
                filterNew.completed_homeworks_sorter = '';
                filterNew.submitted_answers_sorter = '';
                filterNew.correct_answers_sorter = '';
                break;
            case 'deadline':
                filterNew.class_sorter = '';
                filterNew.pupils_count_sorter = '';
                filterNew.deadline_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.completed_homeworks_sorter = '';
                filterNew.submitted_answers_sorter = '';
                filterNew.correct_answers_sorter = '';
                break;
            case 'completed_homework_count':
                filterNew.class_sorter = '';
                filterNew.pupils_count_sorter = '';
                filterNew.deadline_sorter = '';
                filterNew.completed_homeworks_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.submitted_answers_sorter = '';
                filterNew.correct_answers_sorter = '';
                break;
            case 'attempts_total':
                filterNew.class_sorter = '';
                filterNew.pupils_count_sorter = '';
                filterNew.deadline_sorter = '';
                filterNew.completed_homeworks_sorter = '';
                filterNew.submitted_answers_sorter = (sorter.order == undefined) ? '' : sorter.order;
                filterNew.correct_answers_sorter = '';
                break;
            case 'correct_answers':
                filterNew.class_sorter = '';
                filterNew.pupils_count_sorter = '';
                filterNew.deadline_sorter = '';
                filterNew.completed_homeworks_sorter = '';
                filterNew.submitted_answers_sorter = '';
                filterNew.correct_answers_sorter = (sorter.order == undefined) ? '' : sorter.order;
                break;
            default:
                break;
        };
        setFilter(filterNew);
    };

    const handleAddClass = async () => {
        await instance.post('/classes', {className: newClassName});
        await instance.post('/add_action', {action: 'Создание класса',
                                            content: `Создан класс с названием ${newClassName}`});
        updateTable();
    }

    return (
    <>
        <Table dataSource={dataSource} columns={columns} pagination={{total: totalElements, showQuickJumper: true}} onChange={handleChangeFilters}/>
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