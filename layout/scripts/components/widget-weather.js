module.exports = function () {
	function WidgetWeather() {
		const url = {
			startUrl: 'https://api.openweathermap.org/data/2.5/weather?',
			addCityCoord: {
				lat: 'lat=',
				lon: '&lon='
			},
			addAppId: '&appid=f799f16a62d76a7543febccb61f25f93'
		};
		const urlImg = 'https://openweathermap.org/img/wn/';
		const urlJsonFile = '/capital-country.json';
		const urlVisitorsIp = 'https://freegeoip.app/json/';

		const classes = {
			widgetWeather: 'widget-weather',
			selectCityNode: 'widget-weather__select-city',
			selectCityItem: 'weather-forecast__select-city-item',
			widgetWeatherMain: {
				container: 'widget-weather-main',
				cityName: 'widget-weather-main__city-name',
				img: 'widget-weather-main__img',
				temperature: 'widget-weather-main__temperature',
				cloudiness: 'widget-weather-main__cloudiness',
				date: 'widget-weather-main__date'
			},
			widgetWeatherDetail: {
				container: 'widget-weather-detail',
				wind: 'widget-weather-detail__wind',
				cloudiness: 'widget-weather-detail__cloudiness',
				pressure: 'widget-weather-detail__pressure',
				humidity: 'widget-weather-detail__humidity',
				sunrise: 'widget-weather-detail__sunrise',
				sunset: 'widget-weather-detail__sunset',
				detailValue: 'widget-weather-detail__value'
			}
		};

		const widgetsWeather = document.querySelectorAll(`.${classes.widgetWeather}`);

		if (widgetsWeather) {
			widgetsWeather.forEach(init);
		}

		function init(widgetWeather) {
			const selectCityNode = widgetWeather.querySelector(`.${classes.selectCityNode}`);

			const widgetWeatherMainContainer = widgetWeather.querySelector(`.${classes.widgetWeatherMain.container}`);
			const widgetWeatherMain = {
				container: widgetWeatherMainContainer,
				cityName: widgetWeatherMainContainer.querySelector(`.${classes.widgetWeatherMain.cityName}`),
				img: widgetWeatherMainContainer.querySelector(`.${classes.widgetWeatherMain.img}`),
				temperature: widgetWeatherMainContainer.querySelector(`.${classes.widgetWeatherMain.temperature}`),
				cloudiness: widgetWeatherMainContainer.querySelector(`.${classes.widgetWeatherMain.cloudiness}`),
				date: widgetWeatherMainContainer.querySelector(`.${classes.widgetWeatherMain.date}`),
			};

			const widgetWeatherDetailContainer = widgetWeather.querySelector(`.${classes.widgetWeatherDetail.container}`);
			const widgetWeatherDetail = {
				container: widgetWeatherDetailContainer,
				wind: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.wind} .${classes.widgetWeatherDetail.detailValue}`),
				cloudiness: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.cloudiness} .${classes.widgetWeatherDetail.detailValue}`),
				pressure: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.pressure} .${classes.widgetWeatherDetail.detailValue}`),
				humidity: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.humidity} .${classes.widgetWeatherDetail.detailValue}`),
				sunrise: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.sunrise} .${classes.widgetWeatherDetail.detailValue}`),
				sunset: widgetWeatherDetailContainer.querySelector(`.${classes.widgetWeatherDetail.sunset} .${classes.widgetWeatherDetail.detailValue}`)
			};

			if (selectCityNode) {
				renderSelectCity()
					.then(cityArr => {
						weatherVisitorsCountry(cityArr);
					})
					.then(() => {
						selectCityNode.addEventListener('change', handlerSelectCity);
					});
			}

			function weatherVisitorsCountry(cityArr) {
				getVisitorsCountry()
					.then(visitorsCountryCode => {
						const visitorsCountryInfo = cityArr.find(countryInfo => {
							if (countryInfo.country_code === visitorsCountryCode) return true;

							return false;
						});

						if (visitorsCountryInfo) {
							getCityWeather(visitorsCountryInfo.latlng)
								.then(weatherInfo => {
									if (!weatherInfo) return;

									const cityName = `${visitorsCountryInfo.name}, ${visitorsCountryInfo.capital}`
									renderWidgetWeatherInfo(weatherInfo, cityName);
								});
						}
					});

				function getVisitorsCountry() {
					return fetch(urlVisitorsIp)
						.then(response => {
							if (response.status !== 200) {
								throw new Error('');
							}

							return response.json();
						})
						.then(visitorsInfo => visitorsInfo.country_code)
						.catch(() => null);
				}
			}

			function renderSelectCity() {
				return getJsonCityName()
					.then((cityArr) => {
						cityArr.forEach(item => {
							const country = item.name;
							const countryCode = item.country_code;
							const capital = item.capital;
							const capitalCoord = JSON.stringify(item.latlng);

							if (!capital) return;

							const selectOption = `<option value="${countryCode}" data-latlng="${capitalCoord}" class="weather-forecast__select-city-item">${country}, ${capital}</option>`;

							selectCityNode.insertAdjacentHTML('beforeend', selectOption);
						});

						return cityArr;
					})
					.catch(() => {
						console.log('faild');
					});
			}

			function getJsonCityName() {
				return fetch(urlJsonFile)
					.then((response) => {
						if (response.status !== 200) {
							throw new Error('');
						}

						return response.json();
					});
			}

			function handlerSelectCity() {
				const selectedCity = this.querySelector(`.${classes.selectCityItem}[value="${this.value}"]`);
				const cityName = selectedCity.textContent;
				const selectedCityCoord = JSON.parse(selectedCity.dataset.latlng);

				getCityWeather(selectedCityCoord)
					.then((weatherInfo) => {
						if (!weatherInfo) return;

						renderWidgetWeatherInfo(weatherInfo, cityName);
					});
			}

			function getCityWeather(selectedCityCoord) {
				return fetch(url.startUrl + url.addCityCoord.lat + selectedCityCoord[0] + url.addCityCoord.lon + selectedCityCoord[1] + url.addAppId)
					.then((response) => {
						if (response.status !== 200) {
							throw new Error('');
						}

						return response.json();
					})
					.catch(() => {
						console.log('error');

						return null;
					});
			}

			function renderWidgetWeatherInfo(weatherInfo, cityName) {
				if (widgetWeatherMain.container) renderMainInfo();
				if (widgetWeatherDetail.container) renderDetailInfo();

				function renderMainInfo() {
					const img = urlImg + weatherInfo.weather[0].icon + '.png';
					const temperature = (weatherInfo.main.temp - 273).toFixed(2);
					const cloudiness = weatherInfo.weather[0].description;
					const fullDate = new Date();
					const date = fullDate.toLocaleDateString();

					widgetWeatherMain.cityName.textContent = `Weather in ${cityName}`;
					widgetWeatherMain.img.src = img;
					widgetWeatherMain.temperature.textContent = `${temperature} °C`;
					widgetWeatherMain.cloudiness.textContent = `${cloudiness}`;
					widgetWeatherMain.date.textContent = `${date}`;
				}

				function renderDetailInfo() {
					const wind = `${weatherInfo.wind.speed} m/s, (${weatherInfo.wind.deg})`;
					const cloudiness = weatherInfo.weather[0].description;
					const pressure = `${weatherInfo.main.pressure} hpa`;
					const humidity = `${weatherInfo.main.humidity} %`;

					const sunriseFullDate = new Date(weatherInfo.sys.sunrise * 1000);
					const sunsetFullDate = new Date(weatherInfo.sys.sunset * 1000);

					const sunrise = sunriseFullDate.toLocaleTimeString();
					const sunset = sunsetFullDate.toLocaleTimeString();

					widgetWeatherDetail.wind.textContent = wind;
					widgetWeatherDetail.cloudiness.textContent = cloudiness;
					widgetWeatherDetail.pressure.textContent = pressure;
					widgetWeatherDetail.humidity.textContent = humidity;
					widgetWeatherDetail.sunrise.textContent = sunrise;
					widgetWeatherDetail.sunset.textContent = sunset;
				}
			}
		}
	}

	return WidgetWeather;
}();