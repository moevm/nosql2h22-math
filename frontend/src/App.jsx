import {useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Task from './pages/components/Task.jsx'
import Register from './pages/components/Register.jsx'
import Login from './pages/components/Login.jsx'
import Stats from './pages/components/Stats.jsx'
import UserHistory from './pages/components/UserHistory.jsx'
import Navigation from './pages/components/Navigation.jsx'
import AddHometask from './pages/components/AddHometask.jsx'
import Classes from './pages/components/Classes.jsx'
import Class from './pages/components/Class.jsx'
import Logs from './pages/components/Logs.jsx'
import History from './pages/components/History.jsx'

function App() {
    const [navTrigger, setNavTrigger] = useState(false)
    return (
        <BrowserRouter>
            <Navigation navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>
            <Routes>
                <Route path='/login' element={<Login navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>} />
                <Route path='/register' element={<Register navTrigger={navTrigger} setNavTrigger={setNavTrigger}/>} />

                <Route path='/' element={<Task />} />
                <Route path='/stats/:id' element={<Stats />} />
                <Route path='/user_history/:id' element={<UserHistory />} />

                <Route path='/add_hometask' element={<AddHometask />} />
                <Route path='/classes' element={<Classes />} />
                <Route path='/classes/:id' element={<Class />} />

                <Route path='/logs' element={<Logs />} />
                <Route path='/history' element={<History />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;