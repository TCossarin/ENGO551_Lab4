// Initialize map to Calgary
latitude = 51.0447
longitude = -114.0719
var map = L.map('map').setView([latitude, longitude], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


let markersLayer = new L.LayerGroup();
var markersCluster = L.markerClusterGroup();

// Queries database
function searchPermits() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }

    // Format dates to include time for start and end of day
    const formattedStartDate = `${startDate}T00:00:00`;
    const formattedEndDate = `${endDate}T23:59:59`;

    const url = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate between '${formattedStartDate}' and '${formattedEndDate}'`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            markersLayer.clearLayers();     // Clear existing markers
            markersCluster.clearLayers();   // Clear existing clusters
            displayDataOnMap(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please try again later.');
        });
}

// Function to process data and display it
function displayDataOnMap(data) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (data.features && data.features.length > 0) {
        data.features.forEach(function(feature) {
            const {coordinates} = feature.geometry;
            const {issueddate, workclassgroup, contractorname, communityname, originaladdress} = feature.properties;

            // Create and add to the map
            const marker = L.marker([coordinates[1], coordinates[0]])
                .bindPopup(`Date Issued: ${issueddate}<br>Work Class Group: ${workclassgroup}<br>Contractor: ${contractorname}<br>Community: ${communityname}<br>Address: ${originaladdress}`);
            markersLayer.addLayer(marker);

            // Append results to container
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <h4>${communityname}</h4>
                <p>Address: ${originaladdress}</p>
                <p>Date Issued: ${issueddate}</p>
                <p>Work Class Group: ${workclassgroup}</p>
                <p>Contractor: ${contractorname}</p>
            `;
            resultsContainer.appendChild(resultItem);
        });

        markersCluster.addLayer(markersLayer);  // Add markers to the cluster group
        map.addLayer(markersCluster);           // Add cluster group to the map
    } else {
        resultsContainer.innerHTML = '<p>No results found for the selected date range.</p>';
    }
}

markersLayer.addTo(map);    // Add layers to map

var trafficLayer = L.tileLayer('https://api.mapbox.com/styles/v1/tcossar/cltjesste00ob01r52t459pub/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidGNvc3NhciIsImEiOiJjbHRqZThpdTQwcHFsMmtvMzI1NWxqeTF2In0.lNfLefJWqsNCMCH4LUsk8Q', {
    maxZoom: 15,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
});


// toggle the traffic layer
function toggleTrafficLayer() {
    if (map.hasLayer(trafficLayer)) {
        map.removeLayer(trafficLayer);
    } else {
        map.addLayer(trafficLayer);
    }
}


