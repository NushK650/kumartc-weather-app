"use client"
import React, { useState, useEffect } from "react";
import {
    getWeatherData,
    getForecast,
    getWeatherByCoords,
    getForecastByCoords,
} from "@/app/api/weather";
import {
    saveToLocalStorage,
    getLocalStorage,
    removeFromLocalStorage,
} from "@/lib/localStorage";

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
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            };
            let formattedDate = now.toLocaleString("en-US", options);

            formattedDate = formattedDate.replace(/^\w{3}/, (match) => match.toUpperCase());
            formattedDate = formattedDate.replace("AM", "am").replace("PM", "pm");

            setDateTime(formattedDate);
        };

        updateClock();
        const interval = setInterval(updateClock, 60000);
        return () => clearInterval(interval);
    }, []);

    const setLastCity = (city: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("lastCity", city);
        }
    };

    const getLastCity = () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("lastCity");
        }
        return null;
    };

    const applyForecastFromResponse = (forecastResponse: {
        data: { list: ForecastItem[] } | null;
        error: string | null;
    }) => {
        if (forecastResponse.error || !forecastResponse.data) {
            setError(forecastResponse.error ?? "Unable to fetch forecast data. Please try again.");
            return;
        }
        const dailyForecast = forecastResponse.data.list.filter(
            (item: ForecastItem, index: number) => index % 8 === 0
        );
        setForecast(dailyForecast);
        setError(null);
    };

    const fetchByCity = async (city: string) => {
        const trimmed = city.trim();
        if (!trimmed) return;
        if (weather?.name?.toLowerCase() === trimmed.toLowerCase()) return;

        const weatherResponse = await getWeatherData(trimmed);
        if (weatherResponse.error || !weatherResponse.data) {
            setError(weatherResponse.error ?? "City not found. Please try again.");
            return;
        }

        setWeather(weatherResponse.data);
        setError(null);
        setLastCity(weatherResponse.data.name);

        const forecastResponse = await getForecast(trimmed);
        applyForecastFromResponse(forecastResponse);
    };

    const fetchByCoords = async (lat: number, lon: number) => {
        const weatherResponse = await getWeatherByCoords(lat, lon);
        if (weatherResponse.error || !weatherResponse.data) {
            setError(weatherResponse.error ?? "Location not found. Please try again.");
            return;
        }

        setWeather(weatherResponse.data);
        setError(null);
        setLastCity(weatherResponse.data.name);
        setSearchQuery(weatherResponse.data.name);

        const forecastResponse = await getForecastByCoords(lat, lon);
        applyForecastFromResponse(forecastResponse);
    };

    const requestUserLocation = () => {
        if (!navigator?.geolocation) {
            setLocationError("Geolocation is not supported in this browser.");
            return;
        }

        setIsLocating(true);
        setLocationError(null);
        setHasRequestedLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchByCoords(latitude, longitude).finally(() => {
                    setIsLocating(false);
                });
            },
            () => {
                setIsLocating(false);
                setLocationError("Location permission denied. You can search by city instead.");
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
    };

    useEffect(() => {
        const lastCity = getLastCity();
        if (lastCity) {
            fetchByCity(lastCity);
        }
    }, []);

    const handleSearch = async () => {
        fetchByCity(searchQuery);
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
        <div className="radar-bg relative min-h-screen text-[#E8F5FF]">
            <div className="radar-grid absolute inset-0" />
            <div className="radar-rings absolute inset-0" />
            <div className="scanline absolute inset-0" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#7DE2FF]/70">Night City Radar</p>
                        <h1 className="font-display text-4xl md:text-6xl leading-tight glow-text">
                            Stormwatch Interface
                        </h1>
                        <p className="mt-2 text-sm text-[#B9D6FF]/70">
                            Live atmospheric scan with neon precision.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFavorites}
                            className="lg:hidden rounded-full border border-[#2A3C66] bg-[#0C1430]/70 px-4 py-2 text-sm font-semibold text-[#B9D6FF]"
                        >
                            {showFavorites ? "Hide targets" : "Show targets"}
                        </button>
                        <button
                            onClick={requestUserLocation}
                            className="rounded-full bg-[#21E6FF] px-4 py-2 text-sm font-semibold text-[#04101D] shadow-[0_0_24px_rgba(33,230,255,0.45)]"
                            disabled={isLocating}
                        >
                            {isLocating ? "Locating..." : "Use my location"}
                        </button>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <section className="glow-card rounded-3xl border border-[#1F2A4A] bg-[#0B1230]/80 p-6 shadow-[0_30px_80px_-60px_rgba(15,220,255,0.7)] backdrop-blur">
                        <div className="mb-6 flex flex-col gap-3">
                            <label className="text-sm font-semibold text-[#7DE2FF]">Search sector</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Try Oslo, Seoul, or Lima"
                                    className="w-full rounded-2xl border border-[#26335A] bg-[#0A1433] px-4 py-3 pr-20 text-base text-[#E8F5FF] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#21E6FF]/60"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#21E6FF] px-3 py-2 text-xs font-semibold text-[#04101D]"
                                >
                                    Scan
                                </button>
                            </div>
                        </div>

                        {!weather && (
                            <div className="mb-6 rounded-2xl border border-[#1C2A52] bg-[#0B1638] p-4">
                                <p className="font-semibold text-[#E8F5FF]">Use your current location?</p>
                                <p className="text-sm text-[#A8C5F5]/70">
                                    We will ask your browser for permission first.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        onClick={requestUserLocation}
                                        className="rounded-full bg-[#21E6FF] px-4 py-2 text-sm font-semibold text-[#04101D]"
                                        disabled={isLocating}
                                    >
                                        {isLocating ? "Locating..." : "Use my location"}
                                    </button>
                                    <button
                                        onClick={() => fetchByCity("New York")}
                                        className="rounded-full border border-[#2A3C66] bg-[#0C1430] px-4 py-2 text-sm font-semibold text-[#B9D6FF]"
                                    >
                                        Use default city
                                    </button>
                                </div>
                                {(locationError || (hasRequestedLocation && !isLocating)) &&
                                    locationError && (
                                        <p className="mt-3 text-sm text-red-300">{locationError}</p>
                                    )}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {weather && (
                            <div className="rounded-3xl border border-[#18385C] bg-gradient-to-br from-[#081022] via-[#0B1C3C] to-[#0E2852] p-6 text-white shadow-[0_0_40px_rgba(33,230,255,0.2)]">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-[#7DE2FF]/70">Live</p>
                                        <p className="text-2xl font-semibold">{weather.weather[0].main}</p>
                                        <p className="text-sm text-[#B9D6FF]/70">{dateTime}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-4xl font-bold glow-text">
                                            {weather.name.toUpperCase()}
                                        </p>
                                        <button
                                            className="rounded-full border border-[#2A3C66] px-3 py-2 text-sm text-[#B9D6FF]"
                                            onClick={addToFavorites}
                                            title="Add to favorites"
                                            aria-label="Add to favorites"
                                        >
                                            {favorites.includes(weather.name) ? "Tracked" : "Track"}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-display text-6xl md:text-7xl glow-text">
                                            {Math.round(weather.main.temp)}°
                                        </span>
                                        <span className="text-sm text-[#7DE2FF]/70">Signal stable.</span>
                                    </div>
                                    <div className="text-sm text-[#B9D6FF]/70">
                                        H: {Math.round(weather.main.temp_max)}° L: {Math.round(weather.main.temp_min)}°
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="space-y-6">
                        <div
                            className={`${showFavorites ? "block" : "hidden"} lg:block glow-card rounded-3xl border border-[#1F2A4A] bg-[#0B1230]/80 p-6 shadow-[0_20px_60px_-50px_rgba(15,220,255,0.7)] backdrop-blur`}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-2xl text-[#E8F5FF]">Tracked Cities</h2>
                                <span className="text-xs text-[#7DE2FF]/70">{favorites.length} signals</span>
                            </div>

                            {favorites.length > 0 ? (
                                <div className="space-y-2">
                                    {favorites.map((city, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-2xl border border-[#1C2A52] bg-[#0B1638] px-4 py-3"
                                        >
                                            <button
                                                className="text-left font-semibold text-[#E8F5FF]"
                                                onClick={() => {
                                                    setSearchQuery(city);
                                                    fetchByCity(city);
                                                    if (window.innerWidth < 1024) setShowFavorites(false);
                                                }}
                                            >
                                                {city}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFavorite(city);
                                                }}
                                                className="text-xs font-semibold text-[#FF7DBA]"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#A8C5F5]/70">No targets yet.</p>
                            )}
                        </div>

                        <div className="glow-card rounded-3xl border border-[#1F2A4A] bg-[#0B1230]/80 p-6 shadow-[0_20px_60px_-50px_rgba(15,220,255,0.7)] backdrop-blur">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-2xl text-[#E8F5FF]">Radar Outlook</h2>
                                <span className="text-xs text-[#7DE2FF]/70">Every 24 hours</span>
                            </div>
                            {forecast ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {forecast.map((forecastItem: ForecastItem) => {
                                        const dayName = new Date(forecastItem.dt_txt).toLocaleDateString("en-US", {
                                            weekday: "short",
                                        });

                                        return (
                                            <div
                                                key={forecastItem.dt_txt}
                                                className="flex flex-col items-center gap-2 rounded-2xl border border-[#1C2A52] bg-[#0B1638] px-3 py-4"
                                            >
                                                <p className="text-sm font-semibold text-[#E8F5FF]">{dayName}</p>
                                                {forecastItem.weather[0].icon && (
                                                    <img
                                                        src={`http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`}
                                                        alt={forecastItem.weather[0].description}
                                                        className="h-12 w-12"
                                                    />
                                                )}
                                                <p className="text-xs text-[#A8C5F5]/70">{forecastItem.weather[0].main}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-[#A8C5F5]/70">Search a city to see the outlook.</p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default SearchComp;
