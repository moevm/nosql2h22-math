import React, { useState, useCallback } from 'react';
import { Menu } from 'antd';
import { NavLink } from "react-router-dom";


export default function Navigation() {
    let activeStyle = {
        textDecoration: "underline",
    };
    
    let navigation = <></>
    let user = ""
    switch(user){
        case "":
            navigation = <div>
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
            break;
        case "pupil":
            navigation = <div>
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
                <div>Имя Фамилия</div>
                <NavLink
                    to="/logout"
                    style={({ isActive }) =>
                    isActive ? activeStyle : undefined
                    }>Выйти</NavLink>
            </div>
            break;
        case "teacher":
            navigation = <div>
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
                <div>Имя Фамилия</div>
                <NavLink
                    to="/logout"
                    style={({ isActive }) =>
                    isActive ? activeStyle : undefined
                    }>Выйти</NavLink>
            </div>
            break;
        case "administrator":
            navigation = navigation = <div>
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
            <div>Administrator</div>
            <NavLink
                to="/logout"
                style={({ isActive }) =>
                isActive ? activeStyle : undefined
                }>Выйти</NavLink>
        </div>
    }

    return (
        navigation
    )
}