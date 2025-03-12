let isRequestInProgress = false;
let allCoordinates = [];  // Global variable to store all planet coordinates

async function fetchData(endpoint) {
    if (isRequestInProgress) return; // Prevent multiple simultaneous requests
    isRequestInProgress = true;

    try {
        const response = await fetch(endpoint, {
            headers: {
                "X-Super-Client": "helldivers-hub",
                "X-Super-Contact": "NA@gmail.com"
            }
        });

        // Check the rate limit headers
        const rateLimit = response.headers.get('X-Ratelimit-Limit');
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const retryAfter = response.headers.get('Retry-After');

        // Log the rate limit information (for debugging purposes)
        console.log(`Rate Limit: ${rateLimit}`);
        console.log(`Remaining Requests: ${remaining}`);

        // If the rate limit is exhausted, wait before retrying
        if (remaining === "0") {
            console.log(`Rate limit exceeded, retrying after ${retryAfter} seconds.`);
            setTimeout(() => fetchData(endpoint), retryAfter * 1000); // Wait for Retry-After time
            return;
        }

        const text = await response.text();
        console.log(`Raw API Response from ${endpoint}:`, text);

        let data;
        try {
            data = JSON.parse(text);  // Parse the JSON
        } catch (jsonError) {
            console.error("Failed to parse JSON. Response might not be JSON.");
            return;
        }

        // Extract the coordinates and push them into the global coordinates array
        const { x, y } = data.position;
        allCoordinates.push({ x, y });

    } catch (error) {
        console.error("Error fetching data from " + endpoint, error);
    } finally {
        isRequestInProgress = false;
    }
}

// Function to fetch and plot coordinates for all planets based on index
async function fetchAndPlotPlanets() {
    const numberOfPlanets = 50;  // Set the number of planets to fetch (you can adjust this value)

    // Loop through all the planet indices and fetch data for each
    for (let i = 0; i < numberOfPlanets; i++) {
        const planetEndpoint = `https://api.helldivers2.dev/api/v1/planets/${i}`;  // Adjust the endpoint as needed

        await fetchData(planetEndpoint);  // Fetch planet data
    }

    // After all the data is fetched, plot the coordinates
    plotCoordinates(allCoordinates);  // Plot the coordinates on the map
}

// Function to plot coordinates onto the map
function plotCoordinates(coordinates) {
    // Assuming you are using a basic HTML canvas or a plotting library
    const canvas = document.getElementById("planetMap");
    const ctx = canvas.getContext("2d");

    // Clear the canvas before plotting new points
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the scaling (this depends on your map size and coordinate range)
    const scale = 10; // Example scaling factor

    coordinates.forEach(coord => {
        const { x, y } = coord;
        // Plot the point on the canvas
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, 5, 0, Math.PI * 2); // Adjust the radius as needed
        ctx.fillStyle = "blue";  // Change color if needed
        ctx.fill();
    });
}

// Set an interval to fetch and plot the planets every 6 seconds
setInterval(() => {
    allCoordinates = []; // Clear the coordinates array to start fresh each time
    fetchAndPlotPlanets();
}, 6000);
