// main.jsx
import React, { useState, useEffect } from "react";
import { Header } from "../header/Header";
import { Card } from "../component/card";
import './main.css';

export const Main = () => {
    const [asteroids, setAsteroids] = useState([]);
    const [filteredAsteroids, setFilteredAsteroids] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [minSize, setMinSize] = useState(0);
    const [maxSize, setMaxSize] = useState(Infinity);
    const [dangerFilter, setDangerFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("asc");

    // Состояние для хранения астероидов в корзине
    const [markedForDestruction, setMarkedForDestruction] = useState(new Set());

    // Загрузка данных о ближайших объектах
    useEffect(() => {
        fetch("https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=ElN1grRp9GLZYYg8pAerHc3aq8dLfPfmshKAr89I")
            .then(response => response.json())
            .then(data => {
                const asteroidsData = Object.values(data.near_earth_objects).flat();
                setAsteroids(asteroidsData);
                setFilteredAsteroids(asteroidsData);
            });
    }, []);

    // Фильтрация астероидов
    useEffect(() => {
        let filtered = asteroids.filter(asteroid =>
            asteroid.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            asteroid.estimated_diameter.meters.estimated_diameter_min >= minSize &&
            asteroid.estimated_diameter.meters.estimated_diameter_max <= maxSize &&
            (dangerFilter === "all" ||
                (dangerFilter === "dangerous" && asteroid.is_potentially_hazardous_asteroid) ||
                (dangerFilter === "not_dangerous" && !asteroid.is_potentially_hazardous_asteroid))
        );
        if (sortOrder === "asc") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }
        setFilteredAsteroids(filtered);
    }, [searchTerm, minSize, maxSize, dangerFilter, sortOrder, asteroids]);

    // Синхронизация состояния markedForDestruction с данными из сессии
    useEffect(() => {
        const storedCart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const newSet = new Set(storedCart.map(name => asteroids.find(asteroid => asteroid.name === name)?.id));
        setMarkedForDestruction(newSet);
    }, [asteroids]);

    // Функция для добавления астероида в корзину
    const handleMarkForDestruction = (id, name) => {
        setMarkedForDestruction(prevState => {
            const newState = new Set(prevState);
            newState.add(id);
            saveToSession(name); // Сохраняем название в сессию
            return newState;
        });
    };

    // Функция для удаления астероида из корзины
    const handleCancelDestruction = (id, name) => {
        setMarkedForDestruction(prevState => {
            const newState = new Set(prevState);
            newState.delete(id);
            removeFromSession(name); // Удаляем название из сессии
            return newState;
        });
    };

    // Сохранение названия астероида в сессию
    const saveToSession = (name) => {
        let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
        if (!cartItems.includes(name)) {
            cartItems.push(name);
            sessionStorage.setItem('cart', JSON.stringify(cartItems));
        }
    };

    // Удаление названия астероида из сессии
    const removeFromSession = (name) => {
        let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
        const updatedCart = cartItems.filter(item => item !== name);
        sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <div className="main-container">
            <Header />
            <div className="filters">
                <input
                    type="text"
                    placeholder="Поиск"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="size-filter">
                    <label>Мин:</label>
                    <input
                        type="number"
                        value={minSize}
                        onChange={(e) => setMinSize(Number(e.target.value))}
                    />
                    <label>Макс:</label>
                    <input
                        type="number"
                        value={maxSize}
                        onChange={(e) => setMaxSize(Number(e.target.value))}
                    />
                </div>
                <select value={dangerFilter} onChange={(e) => setDangerFilter(e.target.value)}>
                    <option value="all">Все</option>
                    <option value="dangerous">Опасные</option>
                    <option value="not_dangerous">Не опасные</option>
                </select>
                <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    Сортировка {sortOrder === "asc" ? "Z-A" : "A-Z"}
                </button>
            </div>
            <div className="showcase-container">
                <div className="showcase">
                    {filteredAsteroids.map(asteroid => (
                        <Card
                            key={asteroid.id}
                            asteroid={asteroid}
                            isMarkedForDestruction={markedForDestruction.has(asteroid.id)}
                            onMarkForDestruction={() => handleMarkForDestruction(asteroid.id, asteroid.name)}
                            onCancelDestruction={() => handleCancelDestruction(asteroid.id, asteroid.name)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Main;