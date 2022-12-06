import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Task from './pages/components/Task.jsx'
import Register from './pages/components/Register.jsx'
import Login from './pages/components/Login.jsx'
import Stats from './pages/components/Stats.jsx'
import Navigation from './pages/components/Navigation.jsx'

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