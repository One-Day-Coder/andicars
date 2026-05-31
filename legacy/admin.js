const STORAGE_KEY = "andicars_vehicles";

const form = document.querySelector("[data-vehicle-form]");
const list = document.querySelector("[data-vehicle-list]");
const counter = document.querySelector("[data-counter]");
const resetButton = document.querySelector("[data-reset-form]");
const exportButton = document.querySelector("[data-export]");
const importInput = document.querySelector("[data-import]");
const clearButton = document.querySelector("[data-clear]");

function readVehicles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

function vehicleFromForm() {
  const data = new FormData(form);

  return {
    id: data.get("id") || crypto.randomUUID(),
    brand: data.get("brand").trim(),
    model: data.get("model").trim(),
    year: Number(data.get("year")),
    km: data.get("km").trim(),
    type: data.get("type"),
    transmission: data.get("transmission"),
    price: Number(data.get("price")),
    color: data.get("color"),
    image: data.get("image").trim(),
    description: data.get("description").trim()
  };
}

function fillForm(vehicle) {
  form.elements.id.value = vehicle.id;
  form.elements.brand.value = vehicle.brand;
  form.elements.model.value = vehicle.model;
  form.elements.year.value = vehicle.year;
  form.elements.km.value = vehicle.km;
  form.elements.type.value = vehicle.type;
  form.elements.transmission.value = vehicle.transmission;
  form.elements.price.value = vehicle.price;
  form.elements.color.value = vehicle.color || "#0f766e";
  form.elements.image.value = vehicle.image || "";
  form.elements.description.value = vehicle.description || "";
  form.elements.brand.focus();
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  form.elements.color.value = "#0f766e";
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

function renderVehicles() {
  const vehicles = readVehicles();
  counter.textContent = `${vehicles.length} vehiculo${vehicles.length === 1 ? "" : "s"} cargado${vehicles.length === 1 ? "" : "s"}`;

  if (vehicles.length === 0) {
    list.innerHTML = `
      <p class="empty-state">
        Todavia no cargaste vehiculos. Completa el formulario para armar el stock.
      </p>
    `;
    return;
  }

  list.innerHTML = vehicles
    .map(
      (vehicle) => `
        <article class="vehicle-row">
          <div>
            <h3>${vehicle.brand} ${vehicle.model}</h3>
            <p>${vehicle.year} - ${vehicle.km} - ${vehicle.type} - ${vehicle.transmission}</p>
          </div>
          <strong>${formatPrice(vehicle.price)}</strong>
          <div class="row-actions">
            <button type="button" class="button light" data-edit="${vehicle.id}">Editar</button>
            <button type="button" class="button danger" data-delete="${vehicle.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function exportVehicles() {
  const vehicles = readVehicles();
  const file = new Blob([JSON.stringify(vehicles, null, 2)], { type: "application/json" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(file);
  link.download = "andicars-stock.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const vehicles = readVehicles();
  const vehicle = vehicleFromForm();
  const existingIndex = vehicles.findIndex((item) => item.id === vehicle.id);

  if (existingIndex >= 0) {
    vehicles[existingIndex] = vehicle;
  } else {
    vehicles.unshift(vehicle);
  }

  saveVehicles(vehicles);
  resetForm();
  renderVehicles();
});

resetButton.addEventListener("click", resetForm);
exportButton.addEventListener("click", exportVehicles);

clearButton.addEventListener("click", () => {
  const confirmed = confirm("Seguro que queres eliminar todos los vehiculos cargados?");

  if (confirmed) {
    localStorage.removeItem(STORAGE_KEY);
    resetForm();
    renderVehicles();
  }
});

importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  const text = await file.text();
  const importedVehicles = JSON.parse(text);

  if (!Array.isArray(importedVehicles)) {
    alert("El archivo no tiene el formato correcto.");
    return;
  }

  saveVehicles(importedVehicles);
  resetForm();
  renderVehicles();
  importInput.value = "";
});

list.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  const vehicles = readVehicles();

  if (editButton) {
    const vehicle = vehicles.find((item) => item.id === editButton.dataset.edit);

    if (vehicle) {
      fillForm(vehicle);
    }
  }

  if (deleteButton) {
    const confirmed = confirm("Eliminar este vehiculo del stock?");

    if (confirmed) {
      saveVehicles(vehicles.filter((item) => item.id !== deleteButton.dataset.delete));
      renderVehicles();
    }
  }
});

renderVehicles();
