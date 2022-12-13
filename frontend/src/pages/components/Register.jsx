import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {Button, IconButton, TextField} from '@mui/material'
import {VisibilityOutlined, VisibilityOffOutlined, CancelOutlined} from '@mui/icons-material'
import styles from '../styles/Authentification.module.css'


export default function Register({navTrigger, setNavTrigger}){
    const instance = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true
    });

    const navigate = useNavigate();

    const [values, setValues] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        isPupil: true,
        showPassword: false
    });
    
    const handleChange = (prop) => (event) => setValues({...values, [prop]: event.target.value});
    
    const handleClickShowPassword = () => setValues({...values, showPassword: !values.showPassword});

    const handleClickClear = (prop) => (event) => setValues({...values, [prop]: ""});

    const registerUser = async() => {
        var body = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            role: values.isPupil ? "pupil" : "teacher"
        };

        const registerResponse = await instance.post("/register", body);
        if (registerResponse.data.message == "created"){
            body = {
                email: values.email,
                password: values.password
            };

            const response = await instance.post("/login", body);

            if (response.data.message == "Ok")
                instance.get(`/remember-me?id=${response.data.userId}&role=${response.data.userRole}`)
                        .then(res => {setNavTrigger(!navTrigger); switch(response.data.userRole){
                                                                  case "teacher": navigate("../classes"); break;
                                                                  default: navigate("../"); break;}});
        }
    }

    return (
        <>
            <div className={`${styles.form} ${styles.register}`}>
                <div className={styles.role_picker}>
                    <Button className={`${styles.role_button} ${styles.pupil_button} ` + (values.isPupil ? `${styles.role_button_active} ${styles.button_text}` : `${styles.role_button_inactive}`)}
                            onClick={() => {setValues({ ...values, isPupil: true})}}>Я ученик</Button>
                    <Button className={`${styles.role_button} ` + (!values.isPupil ? `${styles.role_button_active} ${styles.button_text}` : `${styles.role_button_inactive}`)}
                            onClick={() => {setValues({ ...values, isPupil: false})}}>Я учитель</Button>
                </div>
                <TextField style={{width: 360, height: 60}}
                           id="firstName"
                           label="Введите имя"
                           type="text"
                           value={values.firstName}
                           onChange={handleChange("firstName")}
                           InputProps={{
                                endAdornment: <IconButton key="firstname-clear-button"
                                                          onClick={handleClickClear("firstName")}
                                                          edge="end">
                                                          <CancelOutlined />
                                              </IconButton>
                }}/>
                <TextField style={{width: 360, height: 60}}
                           id="lastName"
                           label="Введите фамилию"
                           type="text"
                           value={values.lastName}
                           onChange={handleChange("lastName")}
                           InputProps={{
                                endAdornment: <IconButton key="lastname-clear-button"
                                                          onClick={handleClickClear("lastName")}
                                                          edge="end">
                                                          <CancelOutlined />
                                              </IconButton>
                }}/>
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
                <Button className={`${styles.main_button} ${styles.button_text}`} onClick={registerUser}>Зарегистрироваться</Button>
                <div className={styles.sub}>
                    <div>Уже зарегистрированы?</div>
                    <Button className={`${styles.sub_button} ${styles.button_text}`} onClick={() => {navigate("/login")}}>Войти</Button>
                </div>
            </div>
        </>
    )
}