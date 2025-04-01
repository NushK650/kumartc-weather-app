"use client"
import React, { useState, useEffect } from "react";
import { getWeatherData, getForecast } from "@/app/api/weather";
import { saveToLocalStorage, getLocalStorage, removeFromLocalStorage } from "@/lib/localStorage";

interface Weather {
    name: string;
    weather: { main: string; description: string; icon: string }[];
    main: { temp: number; temp_min: number; temp_max: number };
  }
  
  interface ForecastItem {
    dt_txt: string;
    weather: { main: string; description: string; icon: string }[];
  }
  
  type Forecast = ForecastItem[];

const SearchComp = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState(getLocalStorage());
    const [weather, setWeather] = useState<Weather | null>(null);
const [forecast, setForecast] = useState<Forecast | null>(null);
    const [dateTime, setDateTime] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showFavorites, setShowFavorites] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            setDateTime(`${hours}:${minutes}`);
        };

        updateClock();
        const interval = setInterval(updateClock, 60000);
        return () => clearInterval(interval);
    }, []);

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
                const dailyForecast = forecastResponse.data.list.filter((item: any, index: number) => index % 8 === 0);
                setForecast(dailyForecast);
                setError(null);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const addToFavorites = () => {
        if (weather?.name) {
            saveToLocalStorage(weather.name);
            setFavorites(getLocalStorage());
        }
    };

    const removeFavorite = (city: string) => {
        removeFromLocalStorage(city);
        setFavorites(getLocalStorage());
    };

    const toggleFavorites = () => {
        setShowFavorites(!showFavorites);
    };

    return (
        <div className="flex h-screen w-screen bg-gradient-to-t from-[#e7a005] to-[#F3D99F]">
            {/* Favorites Sidebar */}
            <div className={`${showFavorites ? "block" : "hidden"} md:block w-full md:w-1/4 bg-[#e7a005] p-6 overflow-y-auto`}>
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
                                        removeFavorite(city);
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                >
                                    <img className="w-5 " src="./X.svg" alt="Close" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-black">No favorites yet</p>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center p-6 overflow-auto">
                {/* Search Bar */}
                <div className="w-full max-w-2xl mb-6 flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Search for a city..." 
                            className="w-full p-3 pl-4 pr-12 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-0 top-0 h-full px-4 text-black "
                        >
                            <img src="./search.svg" alt="search" />
                        </button>
                    </div>
                    <button 
                        onClick={toggleFavorites}
                        className="md:hidden bg-[#e7a005] text-black px-4 py-2 rounded-full shadow-md transition-colors duration-200"
                    >
                         Favorites
                    </button>
                </div>
                
                
                
                {/* Error Message */}
                {error && (
                    <div className="w-full max-w-2xl bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}

                {/* Weather Display */}
                {weather && (
                    <div className="w-full max-w-4xl bg-[#e7a005] bg-opacity-90 p-6 md:p-8 rounded-xl shadow-lg text-black mt-10">
                        {/* Weather Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                            <button 
                                className="text-4xl   mb-4 md:mb-0"
                                onClick={addToFavorites}
                                title="Add to favorites"
                                aria-label="Add to favorites"
                            >
                                {favorites.includes(weather.name) ? '' : '+'}
                            </button>
                            <span className="text-2xl md:text-3xl font-semibold mb-4 md:mb-0">
                                {weather.weather[0].main}
                            </span>
                            <span className="text-center">
                                <p className="text-2xl md:text-3xl font-bold">
                                    {weather.name.toUpperCase()}
                                </p>
                                <p className="text-xl font-black">{dateTime}</p>

                            </span>
                        </div>
                        
                        {/* Current Weather */}
                        <div className="text-center my-6">
                            <div className="flex flex-col md:flex-row justify-center items-center">
                                <span className="text-7xl md:text-8xl font-bold mt-15">
                                    {Math.round(weather.main.temp)}°
                                </span>
                              
                            </div>
                    
                            <p className="text-xl md:text-2xl font-semibold mt-5">
                                H: {Math.round(weather.main.temp_max)}° L: {Math.round(weather.main.temp_min)}°
                            </p>
                        </div>
                        
                        {/* Weekly Forecast */}
                        {forecast && (
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-10 text-center ">7-Day Forecast</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1 text-center">
            {forecast.map((forecastItem: ForecastItem) => {
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
                )}
            </div>
        </div>
    );
};

export default SearchComp; 
