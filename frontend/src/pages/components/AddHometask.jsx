import React, { useState, useEffect } from 'react'
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { Select, InputNumber, Button, DatePicker } from 'antd'
import {Button as MUIButton, IconButton} from '@mui/material'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import styles from '../styles/AddHometask.module.css'

export default function AddHometask(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    useEffect(() => {
        instance.post('/add_action', {action: 'Открытие страницы',
                                      content: `Открыта страница "Добавить задание"`});
    }, []);

    const navigate = useNavigate();

    const [classesOptions, setClassesOptions] = useState([])

    const categories_options = [
        {
            label: 'Сложение',
            value: 'addition',
        },
        {
            label: 'Вычитание',
            value: 'subtraction',
        },
        {
            label: 'Умножение',
            value: 'multiplication',
        },
        {
            label: 'Деление',
            value: 'division',
        }
    ]

    useEffect(() => {
        const getClasses = async () => {
            const response = await instance.get('/classes-ids');
            if (response.data.status == 200){
                var result = []
                var classes = response.data.data;
                classes.map(class_ => {
                    result.push({label: class_.title, value: class_._id})
                })
                setClassesOptions(result);
            }
        }
        getClasses();
    }, [])

    const [classes, setClasses] = useState([])

    const [tasks_count, setTasksCount] = useState(2)

    const [tasks, setTasks] = useState([
        {
            id: 1,
            categories: [],
            count: 1
        }
    ])

    const [deadline, setDeadline] = useState('')

    const handleChangeClasses = (value) => {
        setClasses(value)
    }

    const handleAddTask = () => {
        setTasks([...tasks, {id: tasks_count, categories: [], count: 1}])
        setTasksCount(tasks_count + 1)
    }

    const deleteTask = (prop) => (e) => {
        setTasks(tasks.filter(item => item.id !== prop))
    }

    const handleUpdateCategories = (prop) => (value) => {
        const index = tasks.findIndex(task => task.id === prop)
        let newTasks = tasks
        newTasks[index].categories = value
        setTasks(newTasks)
    }

    const handleUpdateCount = (prop) => (value) => {
        const index = tasks.findIndex(task => task.id === prop)
        let newTasks = tasks
        newTasks[index].count = value
        setTasks(newTasks)
    }

    const displayHometask = () => <div>
        {tasks.map(task => <div key={task.id} className={styles.task} >
            <Select mode="multiple" style={{width: '100%',marginRight: '5px'}}
                    allowClear placeholder="Выберите категории"
                    defaultValue={task.categories} options={categories_options}
                    onChange={handleUpdateCategories(task.id)}/>
            <div style={{height: '32px'}}>
                <InputNumber min={1} defaultValue={task.count}
                             onChange={handleUpdateCount(task.id)} />
            </div>
            {tasks.length > 1 ?
                <IconButton component="label" onClick={deleteTask(task.id)}>
                    <ClearOutlinedIcon style={{color: 'red', fontSize: 'medium'}}/>
                </IconButton> : <></>}
        </div>)}
    </div>

    const addTask = async () => {
        var body = {
            classIds: classes,
            deadline: deadline,
            homeworkTasks: tasks
        }
        await instance.post("/classes/homeworks", body);
        await instance.post('/add_action', {action: 'Создание задания',
                                            content: `Создано домашнее задание для классов ${classes}, дедлайном ${deadline} и заданиями ${JSON.stringify(tasks)}`});
        navigate('/classes');
    };
    
    return (
        <div className={styles.content}>
            <Select mode="multiple" allowClear style={{width: '300px'}} placeholder="Выберите классы" options={classesOptions} onChange={handleChangeClasses}/>
            <DatePicker showTime style={{width: '300px'}} placeholder="Выберите дедлайн" onChange={(date, dateString) => {setDeadline(dateString)}}/>
            {displayHometask()}
            <Button onClick={handleAddTask}>Добавить строку</Button>
            <MUIButton className={`${styles.main_button} ${styles.button_text}`} onClick={addTask}>Опубликовать задание</MUIButton>
        </div>
    )
}