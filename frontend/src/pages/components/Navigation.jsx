import React from 'react';
import { NavLink } from "react-router-dom";
import styles from '../styles/Navigation.module.css'


export default function Navigation() {
    let activeStyle = {
        color: "#07889B"
    };
    
    let navigation = <></>
    let user = "teacher"
    switch(user){
        case "pupil":
            navigation = <div className={styles.navbar}>
                <div className={styles.center}>
                    <NavLink
                        to="/"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Задачи</NavLink>
                    <NavLink
                        to="/stats"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Статистика</NavLink>
                    <NavLink
                        to="/user_history"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>История</NavLink>
                </div>
                <div className={styles.right}>
                    <div>Имя Фамилия</div>
                    <NavLink
                        to="/logout"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Выйти</NavLink>
                </div>
            </div>
            break;
        case "teacher":
            navigation = <div className={styles.navbar}>
                <div className={styles.center}>
                    <NavLink
                        to="/add_hometask"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Добавить задание</NavLink>
                    <NavLink
                        to="/classes"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Классы</NavLink>
                </div>
                <div className={styles.right}>
                    <div>Имя Фамилия</div>
                    <NavLink
                        to="/logout"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Выйти</NavLink>
                </div>
            </div>
            break;
        case "administrator":
            navigation = <div className={styles.navbar}>
                <div className={styles.center}>
                    <NavLink
                        to="/logs"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Логи</NavLink>
                    <NavLink
                        to="/history"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>История действий</NavLink>
                </div>
                <div className={styles.right}>
                    <div>Administrator</div>
                    <NavLink
                        to="/logout"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Выйти</NavLink>
                </div>
            </div>
            break;
        default:
            navigation = <div className={styles.navbar}>
                <div className={styles.center}>
                    <NavLink
                        to="/"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Задачи</NavLink>
                    <NavLink
                        to="/login"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Войти</NavLink>
                    <NavLink
                        to="/register"
                        style={({ isActive }) =>
                        isActive ? activeStyle : undefined
                        }>Регистрация</NavLink>
                </div>
            </div>
            break;
    }

    return (
        navigation
    )
}