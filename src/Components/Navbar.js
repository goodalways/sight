import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                Sight
            </div>    
            <ul className='navbar-menu'>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/conversations">Conversations</Link></li>
            </ul>
        </div>
    )
}   

export default Navbar;