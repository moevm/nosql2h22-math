import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useParams} from "react-router-dom";
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {Table} from 'antd';
import {IconButton, TextField} from '@mui/material';
import styles from '../styles/Class.module.css';

export default function Class(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
    });

    const [totalElements, setTotalElements] = useState(0);

    const [homeworks, setHomeworks] = useState(<></>);

    const [className, setClassName] = useState('');

    const [dataSource, setDataSource] = useState([]);

    var {id} = useParams();

    const getHometasks = async() => {
        const homeworks_response = await instance.get(`/homeworks?classId=${id}`);
        if (homeworks_response.data.status == 200){
            var homeworks_list = homeworks_response.data.homeworks;
            let i = 0;
            const result = <div className={styles.homeworks}>
                            {homeworks_list.map(homework => (
                            <div key={i++} className={styles.homework}>
                                <div className={styles.title}>
                                    <div>Домашнее задание</div>
                                    <div>От {`${homework.created_timestamp.substring(0, 10)} ${homework.created_timestamp.substring(11, 19)}`}</div>
                                    <div>До {`${homework.deadline_timestamp.substring(0, 10)} ${homework.deadline_timestamp.substring(11, 19)}`}</div>
                                </div>
                                <ol>
                                    {homework.tasks.map(task =>
                                        <li key={i++}>{task.categories.join(" и ") + " - " + task.count}</li>
                                    )}
                                </ol>
                            </div>
                            ))}
                        </div>
            setHomeworks(result)
        }
    }

    const responseToDataSource = (response) => {
        var i = 0;
        var result = [];
        var pupilsArray = response.data;
        setTotalElements(pupilsArray.length);
        pupilsArray.map(pupil => {
            result.push({
                key: i++,
                pupil: pupil.fullName,
                pupil_id: pupil._id,
                login: pupil.email,
                last_activity: `${pupil.lastActivity.timestamp.substring(0, 10)} ${pupil.lastActivity.timestamp.substring(11, 19)}`,
                homework_progress: pupil.homeworkProgress,
                addition_fails: pupil.mistakes.addition,
                subtraction_fails: pupil.mistakes.subtraction,
                multiplication_fails: pupil.mistakes.multiplication,
                division_fails: pupil.mistakes.division,
                distraction_time: pupil.lastDistractionTime
            });
        });
        setDataSource(result);
    };

    const updateTable = () => {
        instance.get(`/classes/${id}/stats`)
                    .then(res => {
                        if (res.data.status == 200)
                            responseToDataSource(res.data)
                    });
    }

    useEffect(() => {
        instance.post('/add_action', {action: 'Открытие страницы',
                                      content: `Открыта страница класса ${id}`});
        instance.get(`/class/${id}`).then(res => setClassName(res.data.title));
        getHometasks();
        updateTable();
    }, []);

    const classInvite = `localhost:5173/join/${id}`

    const deleteUser = async (userId) => {
        await instance.post(`/classes/${id}/delete-pupil`, {userId: userId});
        updateTable();
    }

    const columns = [
        {
            title: 'Фамилия Имя',
            dataIndex: 'pupil',
            key: 'pupil',
            defaultSortOrder: 'descend',
            sorter: () => {},
            render: (text, record) => <a href={`../stats/${record.pupil_id}`}>{text}</a>,
        },
        {
            title: 'Адрес электронной почты',
            dataIndex: 'login',
            key: 'email'
        },
        {
            title: 'Последняя активность',
            dataIndex: 'last_activity',
            key: 'last_activity',
            sorter: () => {}
        },
        {
            title: 'Прогресс ДЗ',
            dataIndex: 'homework_progress',
            key: 'homework_progress',
            sorter: () => {}
        },
        {
            title: 'Ошибок в задачах с сложением',
            dataIndex: 'addition_fails',
            key: 'addition_fails',
            sorter: () => {}
        },
        {
            title: 'Ошибок в задачах с вычитанием',
            dataIndex: 'subtraction_fails',
            key: 'subtraction_fails',
            sorter: () => {}
        },
        {
            title: 'Ошибок в задачах с умножением',
            dataIndex: 'multiplication_fails',
            key: 'multiplication_fails',
            sorter: () => {}
        },
        {
            title: 'Ошибок в задачах с делением',
            dataIndex: 'division_fails',
            key: 'division_fails',
            sorter: () => {}
        },
        {
            title: 'Время возможного отвлекания',
            dataIndex: 'distraction_time',
            key: 'distraction_time'
        },
        {
          title: '',
          key: 'x',
          onCell: (record, rowIndex) => {
            return {
                onClick: (ev) => {
                    deleteUser(record.pupil_id)
                },
            };
          },
          render: (_, record) => <IconButton color="primary" aria-label="upload picture" component="label">
                                    <ClearOutlinedIcon style={{color: 'red', fontSize: 'medium'}}/>
                                 </IconButton>,
        },
    ];

    const onchange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    return (
    <>
        <div className={styles.name}>Класс {className}</div>
        <Table dataSource={dataSource} columns={columns} pagination={{total: totalElements, showQuickJumper: true}} onChange={onchange}/>
        <div className={styles.class_link}>
            <TextField style={{width: 360, height: 60}}
                        id="classinvite"
                        readOnly
                        label="Ссылка на класс"
                        type="text"
                        value={classInvite}
                        InputProps={{readOnly: true,
                                     endAdornment: <IconButton key="name-clear-button" edge="end"
                                                               onClick={() => {navigator.clipboard.writeText(classInvite)}}>
                                                               <ContentCopyIcon />
                                                   </IconButton>
                }}/>
        </div>
        {homeworks}
    </>  
    )
}