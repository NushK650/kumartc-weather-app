import { APIKEY } from "@/lib/environment";

export const getWeatherData = async (city: string) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=imperial`
        );

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: "City not found. Please try again." };
    }
};

export const getForecast = async (city: string) => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKEY}&units=imperial`
        );

        if (!response.ok) {
            throw new Error("Forecast data not available");
        }

        const data = await response.json();
        return { data, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: "Unable to fetch forecast data. Please try again." };
    }
};
