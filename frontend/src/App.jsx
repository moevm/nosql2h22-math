import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/Main.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Navigation from './pages/Navigation.jsx'

function App() {
    return (
        <BrowserRouter>
            <Navigation />
            <Routes>
                <Route path='/' element={<Main />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;