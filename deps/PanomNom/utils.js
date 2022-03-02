async function loadAsync(src) {
  return new Promise((resolve, reject) => {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = src;
    var x = document.getElementsByTagName("script")[0];
    x.parentNode.insertBefore(s, x);
    s.addEventListener("load", resolve);
  });
}

let GoogleStreetViewService;
let GoogleGeoCoder;

function getGoogleStreetViewService() {
  if (GoogleStreetViewService) return GoogleStreetViewService;

  GoogleStreetViewService = new google.maps.StreetViewService();
  return GoogleStreetViewService;
}

function getGoogleGeoCoder() {
  if (GoogleGeoCoder) return GoogleGeoCoder;

  GoogleGeoCoder = new google.maps.Geocoder();
  return GoogleGeoCoder;
}

async function resolveAddress(address) {
  var geocoder = getGoogleGeoCoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: address }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        resolve(results[0].geometry.location);
      } else {
        reject(
          "Geocode was not successful for the following reason: " + status
        );
      }
    });
  });
}

async function getPanoramaById(id) {
  const service = getGoogleStreetViewService();
  return new Promise((resolve, reject) => {
    service.getPanoramaById(id, (data, status) => {
      if (data) {
        resolve(data);
      } else {
        reject(status);
      }
    });
  });
}

async function getIdByLocation(lat, lon) {
  const service = getGoogleStreetViewService();
  const latLng = new google.maps.LatLng(lat, lon);
  // return new Promise((resolve, reject) => {
  try {
    const res = await service.getPanorama({
      location: latLng,
      radius: 50,
      source: "outdoor",
    });
    return res;
  } catch (e) {
    throw e;
  }
  //     , , (data, status) => {
  //     if (data) {
  //       if (data.location.profileUrl) {
  //         console.log(data);
  //         reject("Not a pano");
  //       } else {
  //         console.log(data);
  //         resolve(data.location.pano);
  //       }
  //     } else {
  //       reject(status);
  //     }
  //   });
  // });
}

export {
  loadAsync,
  getGoogleGeoCoder,
  getGoogleStreetViewService,
  getPanoramaById,
  resolveAddress,
  getIdByLocation,
};
