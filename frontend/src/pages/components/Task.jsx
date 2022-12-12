import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {FormControlLabel, IconButton, TextField, Switch} from '@mui/material';
import {CancelOutlined, ArrowForwardRounded} from '@mui/icons-material';
import styles from '../styles/Task.module.css';

export default function Task(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
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

    var role = "pupil";

    var current_homeworks_response = [
        {deadline_timestamp: "11 января 2023",
         tasks: [{categories: ['сложение', 'умножение'],
                  count: 10,
                  progress: 9},
                 {categories: ['вычитание', 'умножение', 'деление'],
                  count: 5,
                  progress: 5},
                 {categories: ['сложение'],
                  count: 15,
                  progress: 3}]},
        {deadline_timestamp: "13 января 2023",
         tasks: [{categories: ['сложение'],
                  count: 30,
                  progress: 21},
                 {categories: ['вычитание', 'деление'],
                  count: 5,
                  progress: 3}]},
        {deadline_timestamp: "15 января 2023",
         tasks: [{categories: ['сложение', 'вычитание', 'умножение', 'деление'],
                  count: 10,
                  progress: 5}]}
    ];

    var i = 0;

    var homeworks = <></>;

    if (role === "pupil")
        homeworks = <div className={styles.homeworks}>
                        {current_homeworks_response.map(homework => (
                        <div key={i++} className={styles.homework}>
                            <div className={styles.title}>
                                <div>Домашнее задание</div>
                                <div>До {homework.deadline_timestamp}</div>
                            </div>
                            <ol>
                                {homework.tasks.map(task =>
                                    <li key={i++}>{task.categories.join(" и ") + " - " + task.progress + "/" + task.count}</li>
                                )}
                            </ol>
                        </div>
                        ))}
                    </div>
    
    const categoriesToArray = () => {
        var result = [];
        Object.keys(categories).forEach(category => {categories[category] ? result.push(category) : null});
        return result;
    };

    const handleChangeAnswer = (event) => {
        setTask({ ...task, user_answer: event.target.value});
    };

    const handleClickClear = (event) => {
        setTask({ ...task, user_answer: "", input_color: "primary"});
    };

    const handleChangeCategory = (e) => {
        var category = e.target.value;
        var newCategories = {...categories};
        newCategories[category] = !newCategories[category];
        if (Object.values(newCategories).some(val => val))
            setCategories(newCategories);
    };

    useEffect(() => {instance.get(`/task?categories=${categoriesToArray().join(" ")}`)
                             .then(res => setTask({...task,
                                                   id: res.data._id,
                                                   content: res.data.content,
                                                   correct_answer: String(res.data.correct_answer),
                                                   was_resolved: false,
                                                   input_color: "primary"}))}, [categories]);

    const handleSubmit = async () => {
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
            } else setTask({ ...task, input_color: "error"});
        }
    }

    const moveForward = () => {
        instance.get(`/task?categories=${categoriesToArray().join(" ")}`)
                .then(res => setTask({...task,
                                      id: res.data._id,
                                      content: res.data.content,
                                      correct_answer: String(res.data.correct_answer),
                                      was_resolved: false,
                                      input_color: "primary"}));
        setTask({ ...task, user_answer: ""});
    };

    const handleKeypress = e => {
        if (e.key == "Enter") handleSubmit();
        else setTask({ ...task, input_color: "primary"});
    };

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