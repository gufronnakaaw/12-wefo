// author: @gufronnakaaw
// date: 30-03-2021

// global variables
const myKey = 'b7712d0c6df17ff82a5e0298d243387a'
const daysName = ['Sun', 'Mon', 'Teu', 'Wed', 'Thu', 'Fri', 'Sat']
const monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// current weather
const currentCity = document.querySelector('.current-city')
const currentTemp = document.querySelector('.current-temp')
const currentDescription = document.querySelector('.current-description')
const currentTime = document.querySelector('.current-time')
const currentWeatherIcon = document.querySelector('.current-weather-icon')
const currentFeelsLike = document.querySelector('.current-feels-like')


// daily weather
const dailyWeatherContainer = document.querySelector('.daily-weather-container')


// other
const detailSection = document.querySelector('.detail-section')
const inputCity = document.querySelector('.input-city')
const loader = document.querySelector('.loader')
const invalidFeedback = document.querySelector('.invalid-feedback')
const btnSearch = document.querySelector('.btn-search')


// on load
window.addEventListener('load', async function(){
    
    if( getLocalStorage('city') ){
        
        await renderWeather(getLocalStorage('city'))
        return
        
    }
    
    await renderWeather('jakarta')
})


// user keydown or click
inputCity.addEventListener('keydown', keydownHandler)
btnSearch.addEventListener('click', clickHandler)


// click handler
async function clickHandler(){

    if( inputCity.value === '' ){
        showError('City not found')
        return
    }
    
    try {
        
        await renderWeather(inputCity.value)
        setLocalStorage('city', inputCity.value)
        removeError()
        inputCity.value = ''

    } catch(e) {
        showError(e.message)
    }


}


// keydown handler
async function keydownHandler(e){

    // check if user press enter, then search
    if( e.key == 'Enter' ) {
        
        if( e.target.value === '' ){
            showError('City not found')
            return
        }
        
        try {
            
            await renderWeather(e.target.value)
            setLocalStorage('city', e.target.value)
            removeError()
            e.target.value = ''
    
        } catch(e) {
            showError(e.message)
        }
    }
}


// set local storage with expiry
function setLocalStorage(key, value){
    const now = new Date()
    const ttl = 500000 // 8 minutes

    const item = {
        value,
        expiry: now.getTime() + ttl
    }

    localStorage.setItem(key, JSON.stringify(item))

}


// get local storage
function getLocalStorage(key) {
    const itemStr = localStorage.getItem(key)

    if(!itemStr) return null

    const item = JSON.parse(itemStr)
    const now = new Date()
    if( now.getTime() > item.expiry ){
        localStorage.removeItem(key)
        return
    }

    return item.value
}


// render weather (current and daily)
async function renderWeather(city) {
    const currentWeather = await getCurrentWeatherByCity(city)

    const dailyWeather = await getDailyWeather(currentWeather.coord.lat, currentWeather.coord.lon)
    const weatherIcons = await getWeatherIcon()

    renderCurrentWeather(currentWeather, weatherIcons)
    renderDailyWeather(dailyWeather, weatherIcons)
}


// render daily weather
function renderDailyWeather(dataDailyWeather, weatherIcons){
    
    let daily = ''
    dataDailyWeather.daily.forEach(el => {
        
        daily += `
        <div class="col-12 mb-3">
            <div class="daily-weather-item d-flex py-3">
                <div class="col-5 text-center">${getCurrentDate(el.dt * 1000)}</div>
                <div class="col-3 d-flex justify-content-center">
                    <i class="${getIconName(weatherIcons, el.weather[0].id)}"></i>
                </div>
                <div class="col-4">${Math.round(el.temp.min)}~${Math.round(el.temp.max)}&#176;C</div>
            </div>
        </div>`
    })

    dailyWeatherContainer.innerHTML = daily
}


// render current weather
function renderCurrentWeather(dataCurrentWeather, weatherIcons){
    const { date, time } = getCurrentTime(dataCurrentWeather.timezone)

    currentCity.innerHTML = `${dataCurrentWeather.name}<sup>${dataCurrentWeather.sys.country}</sup>`
    currentTemp.innerHTML = `${Math.round(dataCurrentWeather.main.temp)}&#176;C`
    currentWeatherIcon.innerHTML = `<i class="${getIconName(weatherIcons, dataCurrentWeather.weather[0].id)}"></i>`
    currentDescription.innerHTML = dataCurrentWeather.weather[0].description
    currentFeelsLike.innerHTML = `<p>Feels like ${Math.round(dataCurrentWeather.main.feels_like)}&#176;C</p>`
    currentTime.innerHTML = `${date} - ${time}`
    const detail = `
        <div class="col-md-6 d-flex justify-content-between text-center">
            <div class="col-4 detail-container">
                <div class="detail-item">Wind</div>

                <div class="detail-icon">
                    <i class="fa fa-wind"></i>
                </div>

                <div class="detail-value">
                    ${Math.round(dataCurrentWeather.wind.speed)} km/h
                </div>
            </div>
        
            <div class="col-4 detail-container">
                <div class="detail-item">
                    Temp min
                </div>

                <div class="detail-icon">
                    <i class="fas fa-temperature-low"></i>
                </div>
                
                <div class="detail-value">
                    ${Math.round(dataCurrentWeather.main.temp_min)}&#176;C
                </div>
            </div>
        
            <div class="col-4 detail-container">
                <div class="detail-item">
                    Temp max
                </div>
                <div class="detail-icon">
                    <i class="fas fa-temperature-high"></i>
                </div>
                <div class="detail-value">
                    ${Math.round(dataCurrentWeather.main.temp_max)}&#176;C
                </div>
            </div>
        </div>
        <div class="col-md-6 d-flex justify-content-between text-center">
            <div class="col-4 detail-container">
                <div class="detail-item">
                    Humidity
                </div>
                <div class="detail-icon">
                    <i class="wi wi-humidity"></i>
                </div>
                <div class="detail-value">
                    ${dataCurrentWeather.main.humidity} %
                </div>
            </div>
        
            <div class="col-4 detail-container">
                <div class="detail-item">
                    Visibility
                </div>
                <div class="detail-icon">
                    <i class="fa fa-eye"></i>
                </div>
                <div class="detail-value">
                    ${dataCurrentWeather.visibility / 1000} km
                </div>
            </div>
        
            <div class="col-4 detail-container">
                <div class="detail-item">
                    Pressure
                </div>
                <div class="detail-icon">
                    <i class="wi wi-barometer"></i>
                </div>
                <div class="detail-value">
                    ${dataCurrentWeather.main.pressure} hPa
                </div>
            </div>
        </div>    
        `

        detailSection.innerHTML = detail

}


// get current weather
function getCurrentWeatherByCity(city){
    loader.style.display = 'block'

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${myKey}`
    
    return fetch(url)
    .finally(() => {
        loader.style.display = 'none'    
    })
    .then(response => response.json())
    .then(result => {
        if( parseInt(result.cod) === 200 ){
            return result
        } else {
            throw new Error(result.message)
        }
    })
}


// get daily weather
function getDailyWeather(lat, lon){
    loader.style.display = 'block'

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${myKey}`
    
    return fetch(url)
    .finally(() => {
        loader.style.display = 'none'
    })
    .then(response => response.json())
    .then(result => result)
}


// get icon
function getWeatherIcon(){
    loader.style.display = 'block'
    
    return fetch('icon/icons.json')
    .finally(() => {
        loader.style.display = 'none'
    })
    .then(response => response.json())
    .then(result => result)
}


// get icon name
function getIconName(dataWeatherIcon, iconId){
    let prefix = 'wi wi-'
    let icon = dataWeatherIcon[iconId].icon

    if (!(iconId > 699 && iconId < 800) && !(iconId > 899 && iconId < 1000)) {
        icon = `day-${icon}`
    }

    icon = prefix + icon
    return icon
}


// get current time
function getCurrentTime(timezone){
    const d = new Date
    const offset = d.getTimezoneOffset()

    d.setMinutes(d.getMinutes() + offset)
    
    const country = timezone / 60
    d.setMinutes(d.getMinutes() + country)

    let time = ''

    if( d.getHours() <= 12 ){
        
        if( d.getHours() < 10 ){
            
            if( d.getMinutes() < 10 ){
                time += `0${d.getHours()}:0${d.getMinutes()} am`
            } else {
                time += `0${d.getHours()}:${d.getMinutes()} am`
            }

        } else {

            if( d.getMinutes() < 10 ){
                time += `${d.getHours()}:0${d.getMinutes()} am`
            } else {
                time += `${d.getHours()}:${d.getMinutes()} am`
            }
        }

    } else {

        if( d.getMinutes() < 10 ){
            time += `${d.getHours()}:0${d.getMinutes()} pm`
        } else {
            time += `${d.getHours()}:${d.getMinutes()} pm`
        }

    }

    const data = {
        date: `${daysName[d.getDay()]}, ${d.getDate()} ${monthsName[d.getMonth()]}`,
        time
    }
    return data
}


// get current date
function getCurrentDate(param, forYear = false) {
    const day = daysName[new Date(param).getDay()]
    const date = new Date(param).getDate()
    const month = monthsName[new Date(param).getMonth()]
    const year = new Date(param).getFullYear()

    return (forYear) ? `${day}, ${date} ${month} ${year}` : `${day}, ${date} ${month}`
}


// error handling section
function showError(message){
    inputCity.classList.add('is-invalid')
    invalidFeedback.innerHTML = `${message}!`
}

function removeError() {
    inputCity.classList.remove('is-invalid')
    invalidFeedback.innerHTML = ''
}