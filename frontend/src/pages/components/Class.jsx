import React, { useState, useEffect } from 'react'
import {FilterFilled} from '@ant-design/icons'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {Button, Checkbox, Col, Row, Table} from 'antd'
import {Button as MUIButton, IconButton, TextField} from '@mui/material'
import styles from '../styles/Class.module.css'

export default function Class(){
    let classID = '1231'

    let classInvite = `localhost:5173/i/${classID}`

    let className = '1А'

    let homeworks_response = [
        {deadline_timestamp: "11 января 2023",
         tasks: [{categories: ['сложение', 'умножение'],
                  count: 10,
                  progress: 9},
                 {categories: ['вычитание', 'умножение', 'деление'],
                  count: 5,
                  progress: 5},
                 {categories: ['сложение'],
                  count: 15,
                  progress: 3}]},
        {deadline_timestamp: "13 января 2023",
         tasks: [{categories: ['сложение'],
                  count: 30,
                  progress: 21},
                 {categories: ['вычитание', 'деление'],
                  count: 5,
                  progress: 3}]},
        {deadline_timestamp: "15 января 2023",
         tasks: [{categories: ['сложение', 'вычитание', 'умножение', 'деление'],
                  count: 10,
                  progress: 5}]}
    ]

    const [dataSource, setDataSource] = useState([
        {
            key: '1',
            pupil: 'Ааа аааа',
            pupil_id: '123',
            login: 'asd@gmail.com',
            last_activity: '15.01.2023 00:01:03',
            homework_progress: 30,
            addition_fails: 5,
            subtraction_fails: 2,
            multiplication_fails: 10,
            division_fails: 12,
            distraction_time: '22.01.2023 01:14:10'
        },{
            key: '2',
            pupil: 'ваыва аааа',
            pupil_id: '124',
            login: 'a4123@gmail.com',
            last_activity: '15.02.2023 12:01:03',
            homework_progress: 5,
            addition_fails: 2,
            subtraction_fails: 5,
            multiplication_fails: 3,
            division_fails: 1,
            distraction_time: '25.01.2023 01:14:10'
        },{
            key: '3',
            pupil: 'йцуйцу йцууйц',
            pupil_id: '333',
            login: 'wewqeqwed@gmail.com',
            last_activity: '11.01.2023 00:01:03',
            homework_progress: 20,
            addition_fails: 1,
            subtraction_fails: 0,
            multiplication_fails: 3,
            division_fails: 5,
            distraction_time: '22.01.2023 01:10:10'
        },
    ]);

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
          key: '',
          render: (_, record) => <a href={`${classID}/delete/${record.pupil_id}`}>
                                        <IconButton color="primary" aria-label="upload picture" component="label">
                                            <ClearOutlinedIcon style={{color: 'red', fontSize: 'medium'}}/>
                                        </IconButton>
                                    </a>,
        },
    ];

    const onchange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    let i = 0

    let homeworks = <div className={styles.homeworks}>
                        {homeworks_response.map(homework => (
                        <div key={i++} className={styles.homework}>
                            <div className={styles.title}>
                                <div>Домашнее задание</div>
                                <div>До {homework.deadline_timestamp}</div>
                            </div>
                            <ol>
                                {homework.tasks.map(task =>
                                    <li key={i++}>{task.categories.join(' и ') + ' - ' + task.count}</li>
                                )}
                            </ol>
                        </div>
                        ))}
                    </div>

    return (
    <>
        <div className={styles.name}>Класс {className}</div>
        <Table dataSource={dataSource} columns={columns} pagination={false} onChange={onchange}/>
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