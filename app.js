'use strict';
//NOTE Global vars
const app = document.querySelector('.weatherApp');
const containerFade = document.querySelectorAll('.fade');

//NOTE Render error
const renderError = function (err) {
  const errMessage = `Could not get your location. Error: ${err.message}`;
  containerApp.insertAdjacentText('afterbegin', errMessage);
  console.error(`Could not get your position ${err.message}`);
};

//NOTE Get position
const getPosition = async function (pos) {
  const { latitude: lat, longitude: lng } = pos.coords;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&exclude={part}&appid=d5cfccc95c1cb360d69ffff3e9daeade`
    );

    if (!res.ok) throw new Error(`Oops, something went to shite...`);

    const data = await res.json();
    console.log(data);

    const dateFormat = function (timestamp) {
      const date = new Date(timestamp * 1000) + '';
      const dateArr = date.split(' ');
      const dateCurTime = dateArr[4].split(':');
      const finalFormat = `
        ${dateArr[0]}, ${dateArr[1]} ${dateArr[2]} ${dateCurTime[0]}:${dateCurTime[1]}
        `;
      return finalFormat;
    };

    const getHour = function (timestamp) {
      const date = new Date(timestamp * 1000) + '';
      return date.split(' ')[4].split(':')[0] + ':00';
    };

    const renderDay = function (timestamp) {
      const day = new Date(timestamp * 1000).getDay();
      return day;
    };

    const renderCurrentWeather = function (currentData) {
      const currentContainer = document.querySelector('.current__forecast');

      const markup = `
        <div class="current__header">
          <div class="current__location">${data.timezone.split('/')[1]}</div>
          <div class="current__date--time">${dateFormat(currentData.dt)}</div>
        </div>
        <div class="current__weather">
          <div class="current__temp--icon">
            <div class="current__icon">
            <img src="http://openweathermap.org/img/wn/${
              currentData.weather[0].icon
            }@2x.png" alt="forecast icon">
            </div>
            <div class="current__temp">${Math.round(currentData.temp)}°</div>
          </div>
        <div class="current__rest">
          <div class="current__description">${currentData.weather[0].main}</div>
          <div class="current__maxMin">${Math.round(
            data.daily[0].temp.max
          )}°/${Math.round(data.daily[0].temp.min)}°</div>
            <div class="current__feelsLike">Feels like ${Math.round(
              currentData.feels_like
            )}°</div>
          </div>
        </div>
      `;
      currentContainer.innerHTML = '';
      currentContainer.insertAdjacentHTML('afterbegin', markup);
    };

    const renderHourlyForecast = function (hourlyData) {
      const hourlyForecastContainer =
        document.querySelector('.hourly__forecast');
      const sevenDayArr = hourlyData.slice(1, 7);
      const markup = `${sevenDayArr
        .map(day => {
          return `
          <div class="current__hourly--forecast">
          <div class="forecast__hour--holder">
            <div class="hour">${getHour(day.dt)}</div>
            <div class="icon">
            <img src="http://openweathermap.org/img/wn/${
              day.weather[0].icon
            }@2x.png" alt="forecast icon">
            </div>
            <div class="temp">${Math.round(day.temp)}°</div>
            <div class="humidity">${Math.round(day.humidity)}%</div>
          </div>
          </div>
        `;
        })
        .join('')}`;

      hourlyForecastContainer.innerHTML = '';
      hourlyForecastContainer.insertAdjacentHTML('afterbegin', markup);
    };

    const renderDailyForecast = function (dailyData) {
      const weekdays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dataWithoutToday = dailyData.slice(1);
      const dailyContainer = document.querySelector('.daily__forecast');
      const markup = `
      ${dataWithoutToday.map(day => {
        console.log(renderDay(day.dt));
        return `
          <div class="day">
            <div class="date">${weekdays[renderDay(day.dt)]}</div>
            <div class="humidity">${day.humidity}%</div>
            <div class="icon">
            <img src="http://openweathermap.org/img/wn/${
              day.weather[0].icon
            }@2x.png" alt="forecast icon">
            </div>
            <div class="maxMin">${Math.round(day.temp.max)}°/${Math.round(
          day.temp.min
        )}°</div>
        </div>
          `;
      })}
      `;

      dailyContainer.innerHTML = '';
      dailyContainer.insertAdjacentHTML(
        'afterbegin',
        markup.replaceAll(',', '')
      );
    };

    renderCurrentWeather(data.current);
    renderHourlyForecast(data.hourly);
    renderDailyForecast(data.daily);
  } catch (err) {
    console.error(err);
  }
};

navigator.geolocation.getCurrentPosition(getPosition, renderError);

window.addEventListener('load', function () {
  containerFade.forEach(cont => (cont.style.opacity = 1));
});
