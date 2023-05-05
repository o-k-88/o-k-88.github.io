const cityName = document.querySelector('input[name="city"]');
const form = document.querySelector("#form");
const weather = document.querySelector(".weather");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (cityName.value === "") {
    const html = `<div class=card-error>
          <div class="card-error__message">Please enter the city or country...🙄</div>
        </div>`;
    weather.innerHTML = html;
  } else {
    const apiKey = "e218dc5b8f13476f98c152716232804";
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName.value.trim()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          const html = `<div class=card-error>
          <div class="card-error__message">Oops...😟 ${data.error.message}</div>
          <p>Try again.</p>
        </div>`;
          weather.innerHTML = html;
          console.log(data.error.message);
        } else {
          console.log(data);
          const { location, current } = data;
          const html = `<div class="card">
      <h2 class="card-country">${location.country}<span>${location.region}</span></h2>
      <h5 class="card-city">${location.name}</h5>
      <div class="card-weather">
        <div class="card-value"> ${current.temp_c}<sup>&#8451</sup></div>
        <img src="${current.condition.icon}" class="card-img"  alt="...">
      </div>
      <div class="card-localtime"><b>Local time:</b> ${location.localtime}</div>
      <div class="card-description">${current.condition.text}</div>
    </div> `;

          weather.innerHTML = html;
        }
      });
  }
});
