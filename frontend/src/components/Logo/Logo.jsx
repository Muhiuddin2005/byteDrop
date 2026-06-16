import React from 'react';

import logo from '../../assets/logo.png'
import { Link } from 'react-router';

const Logo = () => {
    return (
        <Link to="/">
            <div className='flex items-center'>
                <img className='h-8 w-auto object-contain' src={logo} alt="Bytedrop Logo" />
            </div>
        </Link>
    );
};

export default Logo;