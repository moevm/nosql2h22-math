import {useEffect, useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Task from './pages/components/Task.jsx'
import Register from './pages/components/Register.jsx'
import Login from './pages/components/Login.jsx'
import Stats from './pages/components/Stats.jsx'
import Join from './pages/components/Join.jsx'
import UserHistory from './pages/components/UserHistory.jsx'
import Navigation from './pages/components/Navigation.jsx'
import AddHometask from './pages/components/AddHometask.jsx'
import Classes from './pages/components/Classes.jsx'
import Class from './pages/components/Class.jsx'
import Logs from './pages/components/Logs.jsx'
import History from './pages/components/History.jsx'
import Upload from "./pages/components/Upload";

function App() {
    const [navTrigger, setNavTrigger] = useState(false)
    const instance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true,
    });
    const [userRole, setUserRole] = useState({
        role: null
    });
    const [dummy, forceUpdate] = useState(0);
    useEffect(() => {
        const init = async() => {
            const user = await instance.get('/whoami');
            console.log(user.data)
            if(!user.data) {
                setUserRole({role: null});
                return;
            }
            setUserRole({role: user.data.role});
        }
        init().then(() => forceUpdate(dummy + 1));
    }, []);

    return (
        <BrowserRouter>
            <Navigation navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>
            <Routes>
                <Route path='/login' element={<Login navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>} />
                <Route path='/register' element={<Register navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>} />

                <Route path='/' element={userRole.role === null || userRole.role === "pupil" ?
                    <Task/> : userRole.role === "teacher" ? <Classes/> : <Logs/>} />
                <Route path='/join/:id' element={<Join />} />
                <Route path='/stats/:id' element={<Stats />} />
                <Route path='/user_history/:id' element={<UserHistory />} />

                <Route path='/add_hometask' element={<AddHometask />} />
                <Route path='/classes' element={<Classes />} />
                <Route path='/classes/:id' element={<Class />} />

                <Route path='/logs' element={<Logs />} />
                <Route path='/history' element={<History />} />
                <Route path='/upload' element={<Upload/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;