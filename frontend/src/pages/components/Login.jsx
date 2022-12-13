import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import {Button, IconButton, TextField} from '@mui/material';
import {VisibilityOutlined, VisibilityOffOutlined, CancelOutlined} from '@mui/icons-material';
import styles from '../styles/Authentification.module.css';

export default function Login({navTrigger, setNavTrigger}){
    const instance = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true
    });

    const navigate = useNavigate();

    const [values, setValues] = useState({
        email: "",
        password: "",
        showPassword: false
    });
    
    const handleChange = (prop) => (event) => setValues({...values, [prop]: event.target.value});

    const handleClickShowPassword = () => setValues({...values, showPassword: !values.showPassword});

    const handleClickClear = (prop) => (event) => setValues({...values, [prop]: ""});

    const loginUser = async () => {
        var body = {
            email: values.email,
            password: values.password
        }

        const response = await instance.post("/login", body);

        if (response.data.message == "Ok")
            instance.get(`/remember-me?id=${response.data.userId}&role=${response.data.userRole}`)
                    .then(res => {setNavTrigger(!navTrigger);
                                  switch(response.data.userRole){
                                  case "teacher": navigate("../classes"); break;
                                  case "administrator": navigate("../logs"); break;
                                  default: navigate("../"); break;}});
    };

    return (
        <>
            <div className={`${styles.form} ${styles.login}`}>
                <TextField style={{width: 360, height: 60}}
                           id="email"
                           label="Введите адрес электронной почты"
                           type="text"
                           value={values.email}
                           onChange={handleChange("email")}
                           InputProps={{
                                endAdornment: <IconButton key="email-clear-button"
                                                          onClick={handleClickClear("email")}
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
                                                           edge="end">
                                                           {values.showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                               </IconButton>, 
                                               <IconButton key="password-clear-button"
                                                           onClick={handleClickClear("password")}
                                                           edge="end">
                                                           <CancelOutlined />
                                               </IconButton>]
                }}/>
                <Button className={`${styles.main_button} ${styles.button_text}`} onClick={loginUser}>Войти</Button>
                <div className={styles.sub}>
                    <div>Не зарегистрированы?</div>
                    <Button className={`${styles.sub_button} ${styles.button_text}`} onClick={() => {navigate("/register")}}>Зарегистрироваться</Button>
                </div>
            </div>
        </>
    )
}