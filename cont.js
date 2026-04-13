const elSelectBg = document.querySelector(".site-bg");
const elCountryList = document.querySelector(".country-list");
const elSearchInp = document.querySelector(".search-name_inp");
const elSearchBtn = document.querySelector(".search-btn");
const elFilterRegion = document.querySelector(".filter-region");

const BASE_URL = "https://restcountries.com/v3.1";

// 🌙 Theme
function changeSiteColor(color) {
    if (color === "black") {
        document.body.classList.add("black-mode");
        localStorage.setItem("siteColor", "black");
    } else {
        document.body.classList.remove("black-mode");
        localStorage.setItem("siteColor", "white");
    }
}

// Load theme
changeSiteColor(localStorage.getItem("siteColor"));

elSelectBg.addEventListener("change", () => {
    changeSiteColor(elSelectBg.value);
});

// 🌍 Fetch
async function getCountries(url = `${BASE_URL}/all?fields=name,capital,population,flags,region`) {
    try {
        elCountryList.innerHTML = "<h2>Loading...</h2>";
        const res = await fetch(url);
        const data = await res.json();
        renderCountries(data);
    } catch {
        elCountryList.innerHTML = "<h2>Error loading</h2>";
    }
}

getCountries();

// 📄 Render
function renderCountries(arr) {
    elCountryList.innerHTML = "";

    arr.forEach(c => {
        elCountryList.innerHTML += `
        <li class="country">
            <img src="${c.flags.png}">
            <h3>${c.name.common}</h3>
            <h3>👥 ${c.population.toLocaleString()}</h3>
            <h3>🏙 ${c.capital ? c.capital[0] : "No capital"}</h3>
            <h3>🌎 ${c.region}</h3>
        </li>
        `;
    });
}

// 🔍 Search function
async function searchCountry() {
    const value = elSearchInp.value.trim();

    if (!value) return getCountries();

    try {
        const res = await fetch(`${BASE_URL}/name/${value}`);
        const data = await res.json();
        renderCountries(data);
    } catch {
        elCountryList.innerHTML = "<h2>Not found</h2>";
    }
}

// 🔘 Button click
elSearchBtn.addEventListener("click", searchCountry);

// ⌨️ Enter bosilganda
elSearchInp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchCountry();
    }
});

// 🌎 Filter
elFilterRegion.addEventListener("change", () => {
    const region = elFilterRegion.value;

    if (region === "all") return getCountries();

    getCountries(`${BASE_URL}/region/${region}`);
});
// ❤️ Like system (localStorage bilan)
function toggleLike(name) {
    let likes = JSON.parse(localStorage.getItem("likes")) || [];

    if (likes.includes(name)) {
        likes = likes.filter(item => item !== name);
    } else {
        likes.push(name);
    }

    localStorage.setItem("likes", JSON.stringify(likes));
    getCountries(); // qayta render
}

// 🖱 Click event delegation
elCountryList.addEventListener("click", (e) => {
    if (e.target.classList.contains("like-btn")) {
        const name = e.target.dataset.name;
        toggleLike(name);
    }
});

// 🔥 renderni yangilaymiz (LIKE qo‘shamiz)
const oldRender = renderCountries;

renderCountries = function(arr){
    const likes = JSON.parse(localStorage.getItem("likes")) || [];

    elCountryList.innerHTML = "";

    arr.forEach(country => {
        const isLiked = likes.includes(country.name.common);

        elCountryList.innerHTML += `
        <li class="country">
            <img src="${country.flags.png}">
            <h3><b>${country.name.common}</b></h3>
            <h3>👥 ${country.population.toLocaleString()}</h3>
            <h3>🏙 ${country.capital ? country.capital[0] : "No capital"}</h3>
            <h3>🌎 ${country.region}</h3>

            <button class="like-btn" data-name="${country.name.common}">
                ${isLiked ? "❤️ Liked" : "🤍 Like"}
            </button>
        </li>
        `;
    });
};
// 📦 COUNTRY DETAIL MODAL

// modal yaratamiz (HTML ga qo‘shmasdan JS orqali)
const modal = document.createElement("div");
modal.className = "modal";
document.body.appendChild(modal);

// country ustiga bosilganda
elCountryList.addEventListener("click", async (e) => {
    const item = e.target.closest(".country");
    if (!item) return;

    const countryName = item.querySelector("b").textContent;

    try {
        const res = await fetch(`${BASE_URL}/name/${countryName}?fullText=true`);
        const data = await res.json();
        showModal(data[0]);
    } catch (err) {
        console.log(err);
    }
});

// modal chiqarish
function showModal(country) {
    modal.innerHTML = `
    <div class="modal-content">
        <span class="close-btn">&times;</span>

        <img src="${country.flags.png}" class="modal-img">

        <h2>${country.name.common}</h2>

        <p><b>Official:</b> ${country.name.official}</p>
        <p><b>Population:</b> ${country.population.toLocaleString()}</p>
        <p><b>Region:</b> ${country.region}</p>
        <p><b>Subregion:</b> ${country.subregion}</p>
        <p><b>Capital:</b> ${country.capital ? country.capital[0] : "No capital"}</p>
        <p><b>Area:</b> ${country.area} km²</p>
        <p><b>Timezones:</b> ${country.timezones.join(", ")}</p>
    </div>
    `;

    modal.style.display = "flex";

    // ❌ yopish
    modal.querySelector(".close-btn").onclick = () => {
        modal.style.display = "none";
    };
}

// tashqarini bossang yopiladi
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});