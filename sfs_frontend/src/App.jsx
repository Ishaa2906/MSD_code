import Header from './components/header'
import Footer from './components/footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Addfiles from './pages/Addfiles'
import Viewfiles from './pages/Viewfiles'
import { Routes, Route } from 'react-router-dom';
import AdminHome from './pages/AdminHome'
import UserHome from './pages/UserHome';

function App() {
  return ( 
    <div>
    <Header></Header>
    <Routes>
    <Route path="/" element={<Home></Home>} > </Route>
    <Route path="/userhome" element={<UserHome></UserHome>} ></Route>
    <Route path="/adminhome" element={<AdminHome></AdminHome>} ></Route>
    <Route path="/viewfiles" element={<Viewfiles></Viewfiles>} ></Route> 
    <Route path="/contact" element={<Contact></Contact>} ></Route>
    <Route path="/register" element={<Register></Register>}></Route>
    <Route path="/about" element={<About></About>} > </Route>
    <Route path="/login" element={<Login></Login>} > </Route>
    <Route path="/addfiles" element={<Addfiles></Addfiles>} > </Route>
    </Routes>
    <Footer></Footer>
    </div>
  )
}

export default App
