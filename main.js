var map = L.map("map").setView([51.505, -0.09], 13);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1Ijoic3BpdGUiLCJhIjoiMU9EUUJlZyJ9.FXckC6N4GTPsqe1ua1u_5g",
  }
).addTo(map);

let marker;

function onMapClick(e) {
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker(e.latlng).addTo(map);
  console.log("You clicked the map at " + e.latlng);
}

map.on("click", onMapClick);

document.querySelector("#search").addEventListener("change", async (e) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${e.target.value}`;
  const res = await fetch(url, { mode: "cors" });
  debugger;
});
