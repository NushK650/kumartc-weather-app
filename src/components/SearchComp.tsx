"use client";

import React, { useState, useEffect } from "react";
import { getWeatherData, getForecast } from "../app/api/weather";
import { saveToLocalStorage, getLocalStorage, removeFromLocalStorage } from "../lib/localStorage";
import WeatherCard from "./WeatherCard";

const SearchComp = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [weather, setWeather] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);
    const [favorites, setFavorites] = useState<string[]>(getLocalStorage());
    const [error, setError] = useState<string | null>(null);
    const [showFavorites, setShowFavorites] = useState(false);

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            const weatherResponse = await getWeatherData(searchQuery);
            if (weatherResponse.error) {
                setError(weatherResponse.error);
            } else {
                setWeather(weatherResponse.data);
                setError(null);
            }

            const forecastResponse = await getForecast(searchQuery);
            if (forecastResponse.error) {
                setError(forecastResponse.error);
            } else {
                setForecast(forecastResponse.data.list.filter((item: any, index: number) => index % 8 === 0));
                setError(null);
            }
        }
    };

    const addToFavorites = (city: string) => {
        saveToLocalStorage(city);
        setFavorites(getLocalStorage());
    };

    const removeFromFavorites = (city: string) => {
        removeFromLocalStorage(city);
        setFavorites(getLocalStorage());
    };

    const toggleFavorites = () => {
        setShowFavorites(!showFavorites);
    };

    return (
        <div className="flex h-screen w-screen bg-gradient-to-t from-[#e7a005] to-[#F3D99F]">
            <div
                className={`${showFavorites ? "block" : "hidden"} md:block w-full md:w-1/4 bg-[#e7a005] p-6 overflow-y-auto`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Favorites</h1>
                    <button
                        onClick={toggleFavorites}
                        className="md:hidden bg-[#e7a005] px-3 py-1 rounded-full text-white"
                    >
                        Close
                    </button>
                </div>

                {favorites.length > 0 ? (
                    <div className="space-y-2">
                        {favorites.map((city, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-full border border-black transition-colors duration-200"
                            >
                                <p
                                    className="font-bold cursor-pointer truncate"
                                    onClick={() => {
                                        getWeatherData(city);
                                        getForecast(city);
                                        if (window.innerWidth < 768) setShowFavorites(false);
                                    }}
                                >
                                    {city}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromFavorites(city);
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                >
                                    <img className="w-5 " src="/X.svg" alt="Close" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-black">No favorites yet</p>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center p-6 overflow-auto">
                <div className="w-full max-w-2xl mb-6 flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search for a city..."
                            className="w-full p-3 pl-4 pr-12 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-0 top-0 h-full px-4 text-black"
                        >
                            <img src="/search.svg" alt="search" />
                        </button>
                    </div>
                    <button
                        onClick={toggleFavorites}
                        className="md:hidden bg-[#e7a005] text-black px-4 py-2 rounded-full shadow-md transition-colors duration-200"
                    >
                        Favorites
                    </button>
                </div>

                {error && (
                    <div className="w-full max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {weather && <WeatherCard weather={weather} forecast={forecast} addToFavorites={addToFavorites} favorites={favorites} />}
            </div>
        </div>
    );
};

export default SearchComp;
