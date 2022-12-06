import React, { useState, useCallback } from 'react';
import { NavLink } from "react-router-dom";
import './navigation.css'


export default function Navigation() {
    let activeStyle = {
        color: "#07889B"
    };
    
    let navigation = <></>
    let user = "pupil"
    switch(user){
        case "pupil":
            navigation = <div className='navbar'>
                <div className='center'>
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
                <div className='right'>
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
            navigation = <div className='navbar'>
                <div className='center'>
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
                <div className='right'>
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
            navigation = <div className='navbar'>
                <div className='center'>
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
                <div className='right'>
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
            navigation = <div className='navbar'>
                <div className='center'>
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