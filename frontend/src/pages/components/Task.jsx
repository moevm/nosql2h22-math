import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {FormControlLabel, IconButton, TextField, Switch} from '@mui/material';
import {CancelOutlined, ArrowForwardRounded} from '@mui/icons-material';
import styles from '../styles/Task.module.css';

export default function Task(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true,
    });

    const [homeworks, setHomeworks] = useState(<></>);

    const [pupilInfo, setPupil] = useState({
        isPupil: false,
        pupilId: ''
    });

    const [categories, setCategories] = useState({
        addition: true,
        subtraction: true,
        multiplication: true,
        division: true
    });

    const [task, setTask] = useState({
        id: "",
        content: "",
        user_answer: "",
        correct_answer: "",
        was_resolved: false,
        input_color: "primary"
    });

    useEffect(() => {
        const init = async() => {
            const user = await instance.get('/whoami');
            console.log(user.data)
            if (user.data && user.data.role == "pupil")
                setPupil({isPupil: true, pupilId: user.data._id});
        }
        init();
    }, []);
    
    const categoriesToArray = (categoriesObject) => {
        var result = [];
        Object.keys(categoriesObject).forEach(category => {categoriesObject[category] ? result.push(category) : null});
        return result;
    };

    const handleChangeAnswer = (event) => {
        setTask({ ...task, user_answer: event.target.value});
    };

    const handleClickClear = (event) => {
        setTask({ ...task, user_answer: "", input_color: "primary"});
        if (pupilInfo.isPupil)
            instance.post('/add_action', {action: 'Нажатие кнопки',
                                        content: `Очистка поля ввода ответа на задание`});
    };

    const handleChangeCategory = (e) => {
        var category = e.target.value;
        var newCategories = {...categories};
        newCategories[category] = !newCategories[category];
        if (Object.values(newCategories).some(val => val)){
            setCategories(newCategories);
            if (pupilInfo.isPupil)
                instance.post('/add_action', {action: 'Смена категорий',
                                              content: `Изменение категорий на [${categoriesToArray(newCategories).join(", ")}]`});
        };
    };

    useEffect(() => {
        instance.get(`/task?categories=${categoriesToArray(categories).join(" ")}`)
                .then(res => setTask({...task,
                                      id: res.data._id,
                                      content: res.data.content,
                                      correct_answer: String(res.data.correct_answer),
                                      was_resolved: false,
                                      input_color: "primary"}));
    }, [categories]);

    const getHometasks = async() => {
        const homeworks_response = await instance.get(`/homeworks?userId=${pupilInfo.pupilId}&type=in-progress`);
        console.log(homeworks_response);
        if (homeworks_response.data.status == 200){
            var homeworks_list = homeworks_response.data.homeworks;
            let i = 0;
            const result = <div className={styles.homeworks}>
                            {homeworks_list.map(homework => (
                            <div key={i++} className={styles.homework}>
                                <div className={styles.title}>
                                    <div>Домашнее задание</div>
                                    <div>От {`${homework.created_timestamp.substring(0, 10)} ${homework.created_timestamp.substring(11, 19)}`}</div>
                                    <div>До {`${homework.deadline_timestamp.substring(0, 10)} ${homework.deadline_timestamp.substring(11, 19)}`}</div>
                                </div>
                                <ol>
                                    {homework.tasks.map(task =>
                                        <li key={i++} onClick={() => {
                                            setCategories({
                                                addition: task.categories.indexOf("addition") > -1,
                                                subtraction: task.categories.indexOf("subtraction") > -1,
                                                multiplication: task.categories.indexOf("multiplication") > -1,
                                                division: task.categories.indexOf("division") > -1,
                                            })
                                        }}>{task.categories.join(" и ") + " - " + task.progress + "/" + task.count}</li>
                                    )}
                                </ol>
                            </div>
                            ))}
                        </div>
            setHomeworks(result)
        }
    }

    const handleSubmit = async () => {
        if (pupilInfo.isPupil)
            instance.post('/add_action', {action: 'Отправка ответа',
                                          content: `Был отправлен ответ "${task.user_answer}" на задание ${task.content}`});
        if (task.was_resolved){
            (task.user_answer === task.correct_answer) ? setTask({ ...task, input_color: "success"}) :
                                                         setTask({ ...task, input_color: "error"});
        } else {
            var body = {
                taskId: task.id,
                answer: task.user_answer,
                task: {
                    correctAnswer: task.correct_answer
                }
            };

            const response = await instance.post('/submit', body);

            if (response.data.verdict === "correct"){
                setTask({ ...task, input_color: "success", was_resolved: true});
                if (pupilInfo.isPupil)
                    getHometasks();
            } else setTask({ ...task, input_color: "error"});
        };
    };

    const moveForward = async () => {
        const res = await instance.get(`/task?categories=${categoriesToArray(categories).join(" ")}`);
        setTask({...task, id: res.data._id,
                          content: res.data.content,
                          correct_answer: String(res.data.correct_answer),
                          was_resolved: false,
                          input_color: "primary",
                          user_answer: ""});
        if (pupilInfo.isPupil)
            instance.post('/add_action', {action: 'Генерация задания',
                                          content: `Получено задание ${res.data.content} с категориями [${categoriesToArray(categories).join(", ")}]`});
    };

    const handleKeypress = e => {
        if (e.key == "Enter") handleSubmit();
        else setTask({ ...task, input_color: "primary"});
    };

    useEffect(() => {
        if (pupilInfo.isPupil){
            instance.post('/add_action', {action: 'Открытие страницы',
                                          content: `Открыта страница "Задачи"`});
            getHometasks();
        }
    }, [pupilInfo]);

    return (
        <>
            <div className={styles.main}>
                <div className={styles.task}>
                    <div className={styles.task_content}>{task.content}</div>
                    <div className={styles.task_input}>
                        <TextField style={{width: 360, height: 60}}
                                   id="user_answer"
                                   label="Введите ответ"
                                   placeholder="Нажмите Enter для отправки"
                                   type="text"
                                   value={task.user_answer}
                                   onChange={handleChangeAnswer}
                                   onKeyPress={handleKeypress}
                                   color={task.input_color}
                                   InputProps={{
                                        endAdornment: <IconButton key="input-clear-button"
                                                                  onClick={handleClickClear}
                                                                  edge="end">
                                                                  <CancelOutlined />
                                                      </IconButton>
                        }}/>
                        {task.was_resolved ? <IconButton onClick={moveForward}><ArrowForwardRounded /></IconButton> : <></>}
                    </div>
                </div>
                {homeworks}
            </div>
            
            <div className={styles.categories}>
                <div className={styles.switch_field}>
                    <FormControlLabel className={styles.category} control={<Switch checked={categories.addition} onClick={handleChangeCategory} />} value="addition" label="Сложение" labelPlacement="end" />
                </div>
                <div className={styles.switch_field}>
                    <FormControlLabel className={styles.category} control={<Switch checked={categories.subtraction} onClick={handleChangeCategory} />} value="subtraction" label="Вычитание" labelPlacement="end" />
                </div>
                <div className={styles.switch_field}>
                    <FormControlLabel className={styles.category} control={<Switch checked={categories.multiplication} onClick={handleChangeCategory} />} value="multiplication" label="Умножение" labelPlacement="end" />
                </div>
                <div className={styles.switch_field}>
                    <FormControlLabel className={styles.category} control={<Switch checked={categories.division} onClick={handleChangeCategory} />} value="division" label="Деление" labelPlacement="end" />
                </div>
            </div>
        </>
    )
}
