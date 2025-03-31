"use client"
import React from "react";
import { saveToLocalStorage, getLocalStorage, removeFromLocalStorage } from "@/lib/localStorage";

const WeatherCard = ({ weather, forecast, favorites, setFavorites }: any) => {
    const addToFavorites = () => {
        if (weather?.name && !favorites.includes(weather.name)) {
            saveToLocalStorage(weather.name);
            setFavorites(getLocalStorage());
        }
    };
    const WeatherCard = ({ weather, forecast, favorites, setFavorites }: any) => {
        const addToFavorites = () => {
            if (weather?.name && !favorites.includes(weather.name)) {
                saveToLocalStorage(weather.name);
                setFavorites(getLocalStorage());  // Correct usage of setFavorites
            }
        };
    
        const removeFavorite = (city: string) => {
            removeFromLocalStorage(city);
            setFavorites(getLocalStorage());  // Correct usage of setFavorites
        };
    

    return (
        <div className="w-full max-w-4xl bg-[#e7a005] bg-opacity-90 p-6 md:p-8 rounded-xl shadow-lg text-black mt-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <button className="text-4xl mb-4 md:mb-0" onClick={addToFavorites}>
                    {favorites.includes(weather.name) ? "" : "+"}
                </button>
                <span className="text-2xl md:text-3xl font-semibold mb-4 md:mb-0">
                    {weather.weather[0].main}
                </span>
                <p className="text-2xl md:text-3xl font-bold">{weather.name.toUpperCase()}</p>
            </div>

            <div className="text-center my-6">
                <span className="text-7xl md:text-8xl font-bold mt-15">
                    {Math.round(weather.main.temp)}°
                </span>
                <p className="text-xl md:text-2xl font-semibold mt-5">
                    H: {Math.round(weather.main.temp_max)}° L: {Math.round(weather.main.temp_min)}°
                </p>
            </div>

            {forecast && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-10 text-center">7-Day Forecast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-1 text-center">
                        {forecast.map((forecastItem: any) => {
                            const dayName = new Date(forecastItem.dt_txt).toLocaleDateString("en-US", { weekday: "short" });

                            return (
                                <div key={forecastItem.dt_txt} className="flex flex-col items-center">
                                    <p className="font-bold">{dayName}</p>
                                    {forecastItem.weather[0].icon && (
                                        <img
                                            src={`http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`}
                                            alt={forecastItem.weather[0].description}
                                            className="w-16 h-16"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
};

export default WeatherCard;
