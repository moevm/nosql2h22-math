import React, { useState, useEffect } from 'react'
import {Switch, Space} from 'antd'
import {IconButton, TextField} from '@mui/material'
import {CancelOutlined} from '@mui/icons-material'
import styles from '../styles/Task.module.css'

export default function Task(){
    const [values, setValues] = React.useState({
        input: "",
        task: "23-5x4",
        expected: "3",
        input_color: "primary"
    });

    let role = 'pupil'

    let current_homeworks_response = [
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
    let i = 0
    let homeworks = <></>

    if (role === 'pupil')
        homeworks = <div className={styles.homeworks}>
                        {current_homeworks_response.map(homework => (
                        <div key={i++} className={styles.homework}>
                            <div>Домашнее задание</div>
                            <div>До {homework.deadline_timestamp}</div>
                            <ol>
                                {homework.tasks.map(task =>
                                    <li key={i++}>{task.categories.join(' и ') + ' - ' + task.progress + '/' + task.count}</li>
                                )}
                            </ol>
                        </div>
                        ))}
                    </div>
    
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value, input_color: "primary" });
    };

    const handleClickClear = (prop) => (event) => {
        setValues({ ...values, [prop]: "", input_color: "primary"});
    };

    const handleSubmit = () => {
        if (values.input == values.expected)
            setValues({ ...values, input_color: "success" })
        else
            setValues({ ...values, input_color: "error" })
    }

    const handleKeypress = e => {
        if (e.key === 'Enter') handleSubmit()
        if (e.key === 'Backspace') setValues({ ...values, input_color: "primary" });
    };

    return (
        <>
            <div className={styles.main}>
                <div className={styles.task}>
                    <div className={styles.task_content}>{values.task}</div>
                        <TextField style={{width: 360, height: 60}}
                                   id="input"
                                   label="Введите ответ"
                                   placeholder="Нажмите Enter для отправки"
                                   type="text"
                                   value={values.input}
                                   onChange={handleChange("input")}
                                   onKeyPress={handleKeypress}
                                   color={values.input_color}
                                   InputProps={{
                                        endAdornment: <IconButton key="input-clear-button"
                                                                  onClick={handleClickClear("input")}
                                                                  edge="end">
                                                                  <CancelOutlined />
                                                      </IconButton>
                        }}/>
                </div>
                {homeworks}
            </div>
            
            <div className={styles.task_categories}>
                <div className={styles.switch_field}>
                    <div className={styles.switch_content}>
                        <Switch className={styles.switch_task} defaultChecked />
                        <Space size={'large'}/> Сложение
                    </div>
                </div>
                <div className={styles.switch_field}>
                    <div className={styles.switch_content}>
                        <Switch className={styles.switch_task} defaultChecked />
                        <Space /> Вычитание
                    </div>
                </div>
                <div className={styles.switch_field}>
                    <div className={styles.switch_content}>
                        <Switch className={styles.switch_task} defaultChecked />
                        <Space /> Умножение
                    </div>
                </div>
                <div className={styles.switch_field}>
                    <div className={styles.switch_content}>
                        <Switch className={styles.switch_task} defaultChecked />
                        <Space /> Деление
                    </div>
                </div>
            </div>
        </>
    )
}