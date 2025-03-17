import React from "react";
import { Link, useNavigate } from "react-router-dom";
import './Header.css';

export const Header = ({ username }) => {
    const navigate = useNavigate(); // Добавляем useNavigate

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                navigate('/login'); // Перенаправляем на страницу входа
            } else {
                alert('Ошибка при выходе из системы');
            }
        } catch (error) {
            console.error('Ошибка при выходе из системы:', error);
        }
    };

    return (
        <header>
            <div className="nav-container">
                <nav>
                    <ul>
                        <li><Link to="/main">Главная</Link></li>
                        <li><Link to="/cart">Корзина</Link></li>
                    </ul>
                </nav>
                <div className="profile">
                    {/*<span>В{username}</span>*/}
                    <Link to="#" onClick={handleLogout}>Выход</Link>
                </div>
            </div>
        </header>
    );
}
