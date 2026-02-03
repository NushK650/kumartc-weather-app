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
        <div className="relative min-h-screen overflow-hidden bg-[#F6F1EA] text-[#1A1A1A]">
            <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#FFD29D] opacity-70 blur-3xl animate-[float_12s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-[#A8D8FF] opacity-60 blur-3xl animate-[float_16s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#C7F0D8] opacity-60 blur-3xl animate-[float_14s_ease-in-out_infinite]" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-black/50">Weather Atlas</p>
                        <h1 className="font-display text-4xl md:text-6xl leading-tight">
                            Forecasts with a softer edge.
                        </h1>
                        <p className="mt-2 text-sm text-black/60">
                            Search by city or use your current location for instant context.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFavorites}
                            className="lg:hidden rounded-full border border-black/20 bg-white/70 px-4 py-2 text-sm font-semibold"
                        >
                            {showFavorites ? "Hide favorites" : "Show favorites"}
                        </button>
                        <button
                            onClick={requestUserLocation}
                            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                            disabled={isLocating}
                        >
                            {isLocating ? "Locating..." : "Use my location"}
                        </button>
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-black/10 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
                        <div className="mb-6 flex flex-col gap-3">
                            <label className="text-sm font-semibold text-black/70">Search a city</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Try Austin, Reykjavik, or Tokyo"
                                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {!weather && (
                            <div className="mb-6 rounded-2xl border border-black/10 bg-white/80 p-4">
                                <p className="font-semibold">Use your current location?</p>
                                <p className="text-sm text-black/60">
                                    We will ask your browser for permission first.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        onClick={requestUserLocation}
                                        className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                                        disabled={isLocating}
                                    >
                                        {isLocating ? "Locating..." : "Use my location"}
                                    </button>
                                    <button
                                        onClick={() => fetchByCity("New York")}
                                        className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-semibold"
                                    >
                                        Use default city
                                    </button>
                                </div>
                                {(locationError || (hasRequestedLocation && !isLocating)) &&
                                    locationError && (
                                        <p className="mt-3 text-sm text-red-700">{locationError}</p>
                                    )}
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {weather && (
                            <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#10172B] p-6 text-white shadow-lg">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Now</p>
                                        <p className="text-2xl font-semibold">{weather.weather[0].main}</p>
                                        <p className="text-sm text-white/70">{dateTime}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-4xl font-bold">
                                            {weather.name.toUpperCase()}
                                        </p>
                                        <button
                                            className="rounded-full border border-white/20 px-3 py-2 text-sm"
                                            onClick={addToFavorites}
                                            title="Add to favorites"
                                            aria-label="Add to favorites"
                                        >
                                            {favorites.includes(weather.name) ? "Saved" : "Save"}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-display text-6xl md:text-7xl">
                                            {Math.round(weather.main.temp)}°
                                        </span>
                                        <span className="text-sm text-white/60">Feels precise.</span>
                                    </div>
                                    <div className="text-sm text-white/70">
                                        H: {Math.round(weather.main.temp_max)}° L: {Math.round(weather.main.temp_min)}°
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="space-y-6">
                        <div
                            className={`${showFavorites ? "block" : "hidden"} lg:block rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.4)] backdrop-blur`}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-2xl">Favorites</h2>
                                <span className="text-xs text-black/50">{favorites.length} saved</span>
                            </div>

                            {favorites.length > 0 ? (
                                <div className="space-y-2">
                                    {favorites.map((city, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                                        >
                                            <button
                                                className="text-left font-semibold"
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
                                                className="text-xs font-semibold text-red-600"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-black/60">No favorites yet.</p>
                            )}
                        </div>

                        <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.4)] backdrop-blur">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-2xl">5-Day Outlook</h2>
                                <span className="text-xs text-black/50">Every 24 hours</span>
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
                                                className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-4"
                                            >
                                                <p className="text-sm font-semibold">{dayName}</p>
                                                {forecastItem.weather[0].icon && (
                                                    <img
                                                        src={`http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}@2x.png`}
                                                        alt={forecastItem.weather[0].description}
                                                        className="h-12 w-12"
                                                    />
                                                )}
                                                <p className="text-xs text-black/60">{forecastItem.weather[0].main}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-black/60">Search a city to see the outlook.</p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default SearchComp;
