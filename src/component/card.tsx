// card.tsx
import React from 'react';
import './card.css';
import dangerImage from '../images/danger.png';
import notDangerImage from '../images/not_danger.webp';
import dinoColorImage from '../images/dino_ok.png';
import dinoImage from '../images/dino_tense.png';

interface AsteroidProps {
    asteroid: {
        id: string;
        name: string;
        is_potentially_hazardous_asteroid: boolean;
        estimated_diameter: {
            meters: {
                estimated_diameter_min: number;
                estimated_diameter_max: number;
            };
        };
        close_approach_data: {
            miss_distance: {
                kilometers: string;
            };
        }[];
    };
    isMarkedForDestruction: boolean;
    onMarkForDestruction: () => void;
    onCancelDestruction: () => void;
}

export const Card: React.FC<AsteroidProps> = ({
                                                  asteroid,
                                                  isMarkedForDestruction,
                                                  onMarkForDestruction,
                                                  onCancelDestruction,
                                              }) => {
    const {
        name,
        is_potentially_hazardous_asteroid,
        estimated_diameter,
        close_approach_data,
    } = asteroid;

    // Определяем размер астероида
    const diameter = estimated_diameter.meters.estimated_diameter_max;
    let asteroidSizeClass = 'small';
    if (diameter >= 100 && diameter < 500) {
        asteroidSizeClass = 'medium';
    } else if (diameter >= 500) {
        asteroidSizeClass = 'large';
    }

    // Определяем изображение астероида
    const asteroidImage = is_potentially_hazardous_asteroid ? dangerImage : notDangerImage;

    // Определяем изображение динозавра
    const dinoStatusImage =
        !is_potentially_hazardous_asteroid || isMarkedForDestruction
            ? dinoColorImage
            : dinoImage;

    return (
        <div className="card">
            {/* Секция изображений */}
            <div className="image-section">
                <img
                    src={asteroidImage}
                    alt={is_potentially_hazardous_asteroid ? 'Опасный астероид' : 'Не опасный астероид'}
                    className={`asteroid-image ${asteroidSizeClass}`}
                />
                <img
                    src={dinoStatusImage}
                    alt={
                        !is_potentially_hazardous_asteroid || isMarkedForDestruction
                            ? 'Динозавр спокоен'
                            : 'Динозавр напряжен'
                    }
                    className="dino-image"
                />
            </div>

            {/* Секция описания */}
            <div className="description-section">
                <h3>{name}</h3>
                <p><strong>Размер:</strong> {diameter.toFixed(2)} м</p>
                <p>
                    <strong>Расстояние до Земли:</strong>{' '}
                    {parseFloat(close_approach_data[0].miss_distance.kilometers).toFixed(2)} км
                </p>
                <p>
                    <strong>Опасность:</strong>{' '}
                    {is_potentially_hazardous_asteroid ? 'Опасен' : 'Не опасен'}
                </p>
            </div>

            {/* Секция кнопок */}
            <div className="button-section">
                <button
                    onClick={onMarkForDestruction}
                    disabled={isMarkedForDestruction} // Кнопка становится недоступной, если астероид уже в корзине
                >
                    На уничтожение
                </button>
                <button
                    onClick={onCancelDestruction}
                    disabled={!isMarkedForDestruction} // Кнопка становится доступной только для астероидов в корзине
                >
                    Отмена
                </button>
            </div>
        </div>
    );
};