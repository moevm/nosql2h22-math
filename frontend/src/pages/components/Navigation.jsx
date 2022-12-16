import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {NavLink, useNavigate} from 'react-router-dom';
import styles from '../styles/Navigation.module.css';


export default function Navigation({navTrigger, setNavTrigger}) {

    const instance = axios.create({
        baseURL: "http://localhost:8000",
        withCredentials: true
    })

    const navigate = useNavigate();

    const activeStyle = {
        color: "#07889B"
    };

    const [user, setUser] = useState({
        id: "",
        firstName: "",
        lastName: "",
        role: ""
    });

    useEffect(() => {instance.get("/whoami")
                             .then(res => (res.data != null) ?
                                          setUser({id: res.data._id,
                                                   firstName: res.data.first_name,
                                                   lastName: res.data.last_name,
                                                   role: res.data.role}) :
                                          null)}, [navTrigger]);
    
    const logoutUser = async() => {
        await instance.get("/logout");
        setUser({id: "",
                 firstName: "",
                 lastName: "",
                 role: ""});
        navigate("/login");
    };

    const getNavigation = () => {
        var navigation = <></>;

        switch(user.role){
            case "pupil":
                navigation = <div className={styles.navbar}>
                    <div className={styles.center}>
                        <NavLink
                            to="/"
                            style={({ isActive }) =>
                            isActive ? activeStyle : undefined
                            }>Задачи</NavLink>
                        <NavLink
                            to={"/stats/" + user.id}
                            style={({ isActive }) =>
                            isActive ? activeStyle : undefined
                            }>Статистика</NavLink>
                        <NavLink
                            to={"/user_history/" + user.id}
                            style={({ isActive }) =>
                            isActive ? activeStyle : undefined
                            }>История</NavLink>
                    </div>
                    <div className={styles.right}>
                        <div>{user.firstName} {user.lastName}</div>
                        <NavLink onClick={logoutUser}>Выйти</NavLink>
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
                        <div>{user.firstName} {user.lastName}</div>
                        <NavLink onClick={logoutUser}>Выйти</NavLink>
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
                        <NavLink onClick={logoutUser}>Выйти</NavLink>
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
        return navigation;
    }

    return (
        getNavigation()
    )
}