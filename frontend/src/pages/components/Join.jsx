import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useParams, useNavigate} from "react-router-dom";


export default function Task(){
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true,
    });

    const [result, setResult] = useState(<div></div>)

    var {id} = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        const init = async() => {
            const user = await instance.get('/whoami');
            console.log(user.data)
            if (user.data && user.data.role == "pupil")
                instance.post(`/classes/${id}/join`).then(res => {setResult(<div>{res.data.message}</div>); console.log(res)})
        }
        init();
    }, []);

    return (
        <>
        {result}
        </>
    )
}
