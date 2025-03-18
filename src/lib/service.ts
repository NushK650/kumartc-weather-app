export const getWeatherData = async ()=>{
    const response = await fetch('');
    const data = await response.json();

    return data 

}

