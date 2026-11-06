import './Header.css'
import {Link} from 'react-router-dom'
function Header(){
    return(
        <div>
            <div class="header">
            <Link to="/">Home</Link>
            <Link to="/Login">Login</Link>  
            <Link to="/about">About</Link>   
            <Link to="/addfiles">Add files</Link>
            <Link to="/viewfiles">View files</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/Register">Register</Link>
            </div>
        </div>
    )
}
export default Header