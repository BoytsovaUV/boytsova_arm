import React, { useState } from 'react';
import './login_form.css'; // Подключите стили

const LoginForm = () => {
    const [phoneNumber, setPhoneNumber] = useState('+7');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const input = e.target.value.replace(/\D/g, ''); // Оставляем только цифры
        let formattedNumber = '+7';

        if (input.length > 1) {
            formattedNumber += input.slice(1, 11); // Ограничиваем длину номера до 11 символов (+7 + 10 цифр)
        }

        setPhoneNumber(formattedNumber);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/main'; // Переадресация на страницу main
            } else {
                setErrorMessage(data.message || 'Не удалось войти.');
            }
        } catch (error) {
            console.error("Ошибка:", error);
            setErrorMessage("Произошла ошибка на сервере.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {loading && (
                <div id="loading">
                    <img src="../pics/load.gif" alt="Loading..." />
                </div>
            )}
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="phone">Номер телефона:</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phoneNumber}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">Войти</button>
            </form>
            {errorMessage && <div id="errorMessage" style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
};

export default LoginForm;