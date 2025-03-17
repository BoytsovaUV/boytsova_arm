const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const port = 3000;

const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log('Ключ сгенерирован\n' + secretKey);

// Получаем текущую дату и время
const now = new Date();
const formattedDate = now.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
}).replace(',', '');


const ordersFilePath = path.join(__dirname, 'orders.txt');

// Проверка и создание файла orders.txt, если он не существует
fs.readFile(ordersFilePath, 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') {
        fs.writeFile(ordersFilePath, '', (err) => {
            if (err) throw err;
            console.log('Файл orders.txt создан.');
        });
    } else if (err) {
        throw err;
    }
});

// Проверка наличия SESSION_SECRET и вывод сообщения
if (process.env.SESSION_SECRET) {
    console.log('Текущий ключ\n' + process.env.SESSION_SECRET);
}
// Настройка сессий
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Установите true, если используете HTTPS
    })
);

// Middleware для проверки авторизации
function checkAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Для обработки JSON и URL-кодированных данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршрут получения данных из сессии, должен быть перед раздачей статических файлов
app.get('/session-data', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({ phone_number: req.session.phone_number });
    } else {
        res.status(401).json({ message: 'Пользователь не авторизован' });
    }
});

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'build')));

// Перенаправление с корневого URL на страницу логина
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Маршрут для входа
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Обработка логина
app.post('/login', (req, res) => {
    const { phone_number } = req.body;

    // Проверяем, что номер начинается с "+7" и имеет длину 12 символов
    if (!phone_number.startsWith('+7') || phone_number.length !== 12) {
        return res.status(400).json({ success: false, message: 'Неверный формат номера телефона.' });
    }

    // Сохраняем номер телефона в сессии
    req.session.phone_number = phone_number;
    req.session.isAuthenticated = true; // Устанавливаем флаг авторизации

    // Возвращаем успешный ответ
    res.json({ success: true, message: 'Успешный вход.' });
});


// Маршрут для главной страницы (требует авторизации)
app.get('/main', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Маршрут для главной страницы (требует авторизации)
app.get('/cart', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

let orderCounter = 0; // Счетчик для номера строки

// Обработка POST-запроса /destroy
app.post('/destroy', (req, res) => {
    const { asteroids, phone_number } = req.body;

    // Проверка наличия необходимых данных
    if (!asteroids || !Array.isArray(asteroids) || !phone_number) {
        return res.status(400).json({ success: false, message: 'Недостаточно данных' });
    }

    // Увеличиваем счетчик номера строки
    orderCounter++;

    // Форматирование строки для записи в файл
    const formattedAsteroids = asteroids.join(' | ');
    const orderLine = `${orderCounter} | ${phone_number} | ${formattedAsteroids} | ${formattedDate}\n`;

    // Запись строки в файл
    fs.appendFile(ordersFilePath, orderLine, (err) => {
        if (err) {
            console.error('Ошибка записи в файл:', err);
            return res.status(500).json({ success: false, message: 'Ошибка записи заявки' });
        }

        console.log('Заявка успешно оформлена');
        res.json({ success: true, message: 'Заявка успешно оформлена' });
    });
});


// Маршрут для выхода из системы
app.post('/logout', (req, res) => {
    // Проверяем, существует ли сессия
    if (req.session) {
        // Уничтожаем сессию
        req.session.destroy((err) => {
            if (err) {
                // В случае ошибки при уничтожении сессии
                res.status(500).json({ success: false, message: 'Ошибка при завершении сессии' });
            } else {
                // Успешное завершение сессии
                res.clearCookie('connect.sid'); // Очищаем cookie с идентификатором сессии
                res.json({ success: true, message: 'Сессия завершена' });
            }
        });
    } else {
        // Если сессии нет
        res.status(400).json({ success: false, message: 'Сессия не найдена' });
    }
});
// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
