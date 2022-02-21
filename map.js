import { LitElement, html } from "https://unpkg.com/lit?module";

/* <link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
  integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
  crossorigin=""
/>
<script
  src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
  integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
  crossorigin=""
></script> */

class MapBrowser extends LitElement {
  constructor() {
    super();
    this.marker = null;
  }

  async loadResources() {
    const cssPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.setAttribute("rel", "stylesheet");
      css.setAttribute(
        "href",
        "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
      );
      css.setAttribute(
        "integrity",
        "sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
      );
      css.setAttribute("crossorigin", "");
      css.addEventListener("load", (e) => {
        resolve();
      });
      document.head.append(css);
    });

    const scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute(
        "src",
        "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
      );
      script.setAttribute(
        "integrity",
        "sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
      );
      script.setAttribute("crossorigin", "");
      script.addEventListener("load", (e) => {
        resolve();
      });
      document.head.append(script);
    });

    return Promise.all([cssPromise, scriptPromise]);
  }

  async firstUpdated() {
    await this.loadResources();
    const mapDiv = this.shadowRoot.querySelector("#map");
    this.map = L.map(mapDiv).setView([51.505, -0.09], 13);

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
    ).addTo(this.map);

    this.map.on("click", (e) => this.onMapClick(e));
  }

  onMapClick(e) {
    this.addMarker(e.latlng.lat, e.latlng.lng);
  }

  moveTo(lat, lng) {
    this.removeMarker();
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.panTo([lat, lng]);
  }

  removeMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
  }

  addMarker(lat, lng) {
    this.moveTo(lat, lng);
    const e = new CustomEvent("map-selection", {
      bubbles: true,
      detail: { latLng: { lat, lng } },
    });
    this.dispatchEvent(e);
  }

  async onChange(e) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${e.target.value}`;
    const res = await fetch(url, { mode: "cors" });
    const data = await res.json();
    const city = data[0];
    const bb = city.boundingbox;
    this.map.fitBounds([
      [parseFloat(bb[0]), parseFloat(bb[2])],
      [parseFloat(bb[1]), parseFloat(bb[3])],
    ]);
    this.addMarker(parseFloat(city.lat), parseFloat(city.lon));
  }

  onLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.addMarker(pos.coords.latitude, pos.coords.longitude);
      },
      (e) => {
        debugger;
      },
      { enableHighAccuracy: true }
    );
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
        }
        #map {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 2em;
        }
        #tools {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
      </style>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossorigin=""
      />
      <div id="map"></div>
      <div id="tools">
        <input type="text" id="search" @change=${this.onChange} />
        <button @click=${this.onLocation}>My location</button>
        <div></div>
      </div>
    `;
  }
}
customElements.define("map-browser", MapBrowser);
