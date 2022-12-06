import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Task from './pages/Task.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Stats from './pages/Stats.jsx'
import Navigation from './pages/Navigation.jsx'

function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path='/' element={<Task />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/stats' element={<Stats />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;