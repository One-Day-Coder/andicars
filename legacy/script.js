const STORAGE_KEY = "andicars_vehicles";

const defaultCars = [
  {
    brand: "Toyota",
    model: "Corolla XEI",
    year: 2021,
    km: "52.000 km",
    type: "Sedan",
    transmission: "Automatico",
    price: 24500,
    color: "#637083",
    description: "Excelente estado general, service al dia y lista para transferir."
  },
  {
    brand: "Volkswagen",
    model: "Nivus Highline",
    year: 2022,
    km: "38.000 km",
    type: "SUV",
    transmission: "Automatico",
    price: 27800,
    color: "#234b4a",
    description: "SUV compacta con buen equipamiento, confort y bajo consumo."
  },
  {
    brand: "Ford",
    model: "Ranger XLT",
    year: 2020,
    km: "74.000 km",
    type: "Pickup",
    transmission: "Manual",
    price: 31900,
    color: "#7a2f2f",
    description: "Pickup robusta para trabajo y uso familiar, documentacion completa."
  },
  {
    brand: "Peugeot",
    model: "208 Allure",
    year: 2023,
    km: "19.000 km",
    type: "Hatchback",
    transmission: "Manual",
    price: 17800,
    color: "#d9922e",
    description: "Unidad moderna, muy cuidada, ideal para ciudad y ruta."
  },
  {
    brand: "Chevrolet",
    model: "Tracker LTZ",
    year: 2021,
    km: "46.000 km",
    type: "SUV",
    transmission: "Automatico",
    price: 23600,
    color: "#394150",
    description: "Buen espacio interior, seguridad completa y manejo agil."
  },
  {
    brand: "Fiat",
    model: "Cronos Precision",
    year: 2022,
    km: "33.000 km",
    type: "Sedan",
    transmission: "Manual",
    price: 16400,
    color: "#0f766e",
    description: "Sedan nacional con gran baul, bajo mantenimiento y muy buen andar."
  }
];

function getStoredCars() {
  const savedCars = localStorage.getItem(STORAGE_KEY);

  if (!savedCars) {
    return defaultCars;
  }

  try {
    const parsedCars = JSON.parse(savedCars);
    return Array.isArray(parsedCars) && parsedCars.length > 0 ? parsedCars : defaultCars;
  } catch {
    return defaultCars;
  }
}

let cars = getStoredCars();

const grid = document.querySelector("[data-car-grid]");
const emptyState = document.querySelector("[data-empty]");
const searchInput = document.querySelector("[data-search]");
const typeSelect = document.querySelector("[data-type]");
const priceSelect = document.querySelector("[data-price]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");
const form = document.querySelector("[data-contact-form]");

const formatPrice = (price) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);

function renderCars() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeSelect.value;
  const maxPrice = priceSelect.value;

  const filteredCars = cars.filter((car) => {
    const text = `${car.brand} ${car.model} ${car.type}`.toLowerCase();
    const matchesText = text.includes(query);
    const matchesType = type === "todos" || car.type === type;
    const matchesPrice = maxPrice === "todos" || car.price <= Number(maxPrice);

    return matchesText && matchesType && matchesPrice;
  });

  grid.innerHTML = filteredCars
    .map(
      (car) => `
        <article class="car-card">
          ${renderCarVisual(car)}
          <div class="car-body">
            <div class="car-title">
              <h3>${car.brand} ${car.model}</h3>
              <span class="price">${formatPrice(car.price)}</span>
            </div>
            <div class="car-meta">
              <span class="pill">${car.year}</span>
              <span class="pill">${car.km}</span>
              <span class="pill">${car.type}</span>
              <span class="pill">${car.transmission}</span>
            </div>
            <p>${car.description}</p>
          </div>
        </article>
      `
    )
    .join("");

  emptyState.hidden = filteredCars.length > 0;
}

function renderCarVisual(car) {
  if (car.image) {
    return `
      <div class="car-photo">
        <img src="${car.image}" alt="${car.brand} ${car.model}" />
      </div>
    `;
  }

  return `
    <div class="car-visual" style="--card-color: ${car.color || "#637083"}">
      <div class="car-wheels" aria-hidden="true"><span></span><span></span></div>
    </div>
  `;
}

function buildWhatsAppMessage(data) {
  return [
    "Hola AndiCars, quiero hacer una consulta.",
    `Nombre: ${data.get("nombre")}`,
    `Telefono: ${data.get("telefono")}`,
    `Interes: ${data.get("interes")}`,
    `Mensaje: ${data.get("mensaje") || "Sin mensaje adicional"}`
  ].join("\n");
}

[searchInput, typeSelect, priceSelect].forEach((control) => {
  control.addEventListener("input", renderCars);
});

menuButton.addEventListener("click", () => {
  menu.classList.toggle("is-open");
});

menu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    menu.classList.remove("is-open");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const message = encodeURIComponent(buildWhatsAppMessage(data));
  const phone = "5491112345678";

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
  form.reset();
});

renderCars();
