import React from 'react'
import { useNavigate } from "react-router-dom";
import {Button, IconButton, TextField} from '@mui/material'
import {VisibilityOutlined, VisibilityOffOutlined, CancelOutlined} from '@mui/icons-material'
import styles from '../styles/Authentification.module.css'

export default function Login(){
    const [values, setValues] = React.useState({
        login: "",
        password: "",
        showPassword: false
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
            <div className={`${styles.form} ${styles.login}`}>
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
                <Button className={`${styles.main_button} ${styles.button_text}`}>Войти</Button>
                <div className={styles.sub}>
                    <div>Не зарегистрированы?</div>
                    <Button className={`${styles.sub_button} ${styles.button_text}`} onClick={() => {navigate('/register')}}>Зарегистрироваться</Button>
                </div>
            </div>
        </>
    )
}