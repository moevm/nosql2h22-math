import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import {Button, IconButton, TextField} from '@mui/material'
import {VisibilityOutlined, VisibilityOffOutlined, CancelOutlined} from '@mui/icons-material'
import './authentification.css'

export default function Register(){
    const [values, setValues] = React.useState({
        name: "",
        surname: "",
        login: "",
        password: "",
        showPassword: false,
        isPupil: true
    });
    
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };
    
    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword
        });
    };

    const handleClickClear = (prop) => (event) => {
        setValues({ ...values, [prop]: "" });
    };
    
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const navigate = useNavigate();

    return (
        <>
            <div className='form'>
                <div className='role-picker'>
                    <Button className={'role-button pupil-button ' + (values.isPupil ? 'role-button-active button-text' : 'role-button-inactive')}
                            onClick={() => {setValues({ ...values, isPupil: true})}}>Я ученик</Button>
                    <Button className={'role-button ' + (!values.isPupil ? 'role-button-active button-text' : 'role-button-inactive')}
                            onClick={() => {setValues({ ...values, isPupil: false})}}>Я учитель</Button>
                </div>
                <TextField style={{width: 360, height: 60}}
                           id="name"
                           label="Введите имя"
                           type="text"
                           value={values.name}
                           onChange={handleChange("name")}
                           InputProps={{
                                endAdornment: <IconButton key="name-clear-button"
                                                          onClick={handleClickClear("name")}
                                                          edge="end">
                                                          <CancelOutlined />
                                              </IconButton>
                }}/>
                <TextField style={{width: 360, height: 60}}
                           id="surname"
                           label="Введите фамилию"
                           type="text"
                           value={values.surname}
                           onChange={handleChange("surname")}
                           InputProps={{
                                endAdornment: <IconButton key="surname-clear-button"
                                                          onClick={handleClickClear("surname")}
                                                          edge="end">
                                                          <CancelOutlined />
                                              </IconButton>
                }}/>
                <TextField style={{width: 360, height: 60}}
                           id="login"
                           label="Введите адрес электронной почты"
                           type="text"
                           value={values.login}
                           onChange={handleChange("login")}
                           InputProps={{
                                endAdornment: <IconButton key="login-clear-button"
                                                          onClick={handleClickClear("login")}
                                                          edge="end">
                                                          <CancelOutlined />
                                              </IconButton>
                }}/>
                <TextField style={{width: 360, height: 60}}
                           id="password"
                           label="Введите пароль"
                           type={values.showPassword ? "text" : "password"}
                           value={values.password}
                           onChange={handleChange("password")}
                           InputProps={{
                                endAdornment: [<IconButton key="password-visibility-button"
                                                           onClick={handleClickShowPassword}
                                                           onMouseDown={handleMouseDownPassword}
                                                           edge="end">
                                                           {values.showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                               </IconButton>, 
                                               <IconButton key="password-clear-button"
                                                           onClick={handleClickClear("password")}
                                                           edge="end">
                                                           <CancelOutlined />
                                               </IconButton>]
                }}/>
                <Button className='main-button button-text'>Зарегистрироваться</Button>
                <div className='sub'>
                    <div>Уже зарегистрированы?</div>
                    <Button className='sub-button button-text' onClick={() => {navigate('/login')}}>Войти</Button>
                </div>
            </div>
        </>
    )
}