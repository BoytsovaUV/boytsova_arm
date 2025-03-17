// cart.jsx
import React, { useState, useEffect } from "react";
import './cart.css';
import { Header } from "../header/Header";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [phone_number, setPhoneNumber] = useState(null); // Для хранения номера телефона

    // Загрузка данных из сессии при монтировании компонента
    useEffect(() => {
        const storedCart = JSON.parse(sessionStorage.getItem('cart')) || [];
        setCartItems(storedCart);

        // Получаем номер телефона из сессии
        fetch('/session-data')
            .then(response => response.json())
            .then(data => {
                if (data.phone_number) {
                    setPhoneNumber(data.phone_number);
                }
            })
            .catch(error => {
                console.error('Ошибка при получении данных сессии:', error);
            });
    }, []);

    // Функция для удаления астероида из корзины
    const handleRemoveFromCart = (name) => {
        const updatedCart = cartItems.filter(item => item !== name);
        setCartItems(updatedCart);
        sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // Функция для оформления заявки
    const handlePlaceOrder = () => {
        if (!phone_number) {
            return alert('Номер телефона не найден. Пожалуйста, авторизуйтесь.');
        }

        fetch('/destroy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ asteroids: cartItems, phone_number }), // Добавляем phone_number
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Заявка успешно оформлена!');
                    sessionStorage.removeItem('cart'); // Очищаем корзину после успешной отправки
                    setCartItems([]); // Обновляем состояние компонента
                } else {
                    alert('Ошибка при оформлении заявки');
                }
            })
            .catch(error => {
                console.error('Ошибка при оформлении заявки:', error);
            });
    };

    return (
        <div className="cart-container">
            <Header />
            <div className="header-container">
                <h2 className="cart-title">Корзина</h2>
                <button className="clear-cart-button" onClick={() => {
                    sessionStorage.removeItem('cart');
                    setCartItems([]);
                }}>Очистить корзину</button>
            </div>
            <div className="showcase-cart-container">
                {cartItems.length > 0 ? (
                    <ul className="cart-list">
                        {cartItems.map((item, index) => (
                            <li key={index} className="cart-item">
                                <span>{item}</span>
                                <button onClick={() => handleRemoveFromCart(item)}>Отмена</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Корзина пуста</p>
                )}
            </div>
            <button className="place-order-button" onClick={handlePlaceOrder} disabled={cartItems.length === 0}>
                Оформить заявку
            </button>
        </div>
    );
};

export default Cart;