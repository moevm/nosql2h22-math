import React, { useState, useEffect } from 'react'
import {Switch, Space} from 'antd'
import {IconButton, TextField} from '@mui/material'
import {CancelOutlined} from '@mui/icons-material'
import './task.css'

export default function Task(){
    const [values, setValues] = React.useState({
        input: "",
        task: "23-5x4",
        expected: "3",
        input_color: "primary"
    });
    
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
            <div className='task'>
                <div className='task-content'>{values.task}</div>
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
            
            <div className='task-categories'>
                <div className='switch-field'>
                    <div className='switch-content'>
                        <Switch className='switch-task' defaultChecked />
                        <Space size={'large'}/> Сложение
                    </div>
                </div>
                <div className='switch-field'>
                    <div className='switch-content'>
                        <Switch className='switch-task' defaultChecked />
                        <Space /> Вычитание
                    </div>
                </div>
                <div className='switch-field'>
                    <div className='switch-content'>
                        <Switch className='switch-task' defaultChecked />
                        <Space /> Умножение
                    </div>
                </div>
                <div className='switch-field'>
                    <div className='switch-content'>
                        <Switch className='switch-task' defaultChecked />
                        <Space /> Деление
                    </div>
                </div>
            </div>
        </>
    )
}