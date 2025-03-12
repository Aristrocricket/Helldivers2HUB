let isRequestInProgress = false;

async function fetchData(endpoint) {
    if (isRequestInProgress) return; // Prevent multiple simultaneous requests
    isRequestInProgress = true;

    try {
        const response = await fetch(`https://api.helldivers2.dev/api/v1/${endpoint}`, {
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

        // Dynamically process the data (update this to suit your needs)
        renderDynamicData(data, endpoint);

    } catch (error) {
        console.error("Error fetching data from " + endpoint, error);
    } finally {
        isRequestInProgress = false;
    }
}

// Function to dynamically render the data based on endpoint and structure
function renderDynamicData(data, endpoint) {
    const container = document.getElementById("dataContainer");

    // Clear the container before rendering new data
    container.innerHTML = '';

    // Define the list of allowed keys (you can load this list dynamically if needed)
    const allowedKeys = ["playerCount", "bulletsFired", "terminidKills", "automatonKills", "missionSuccessRate", "illuminateKills", "bulletsHit", "deaths"]; // Example list

    // Iterate through all the statistics in the data and create elements for each allowed key
    for (const key in data.statistics) {
        if (allowedKeys.includes(key)) {  // Check if the key is in the allowed keys list
            const value = data.statistics[key];

            // Create a new li element for each statistic dynamically
            const statElement = document.createElement('li');
            statElement.classList.add('stat-item');
            
            // Customize the styling as needed
            statElement.innerHTML = `
                <strong>${formatKeyName(key)}:</strong> <span class="dynamic-value">${value}</span>
            `;
            
            // Append the created element to the container
            container.appendChild(statElement);
        }
    }
}

// Helper function to format the key name (e.g., "playerCount" -> "Player Count")
function formatKeyName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getEndpointData(endpoint) {
    fetchData(endpoint);  // Call the dynamic fetch function with the desired endpoint
}

// Example usage: Fetch data for /api/v1/war every 6 seconds
setInterval(() => getEndpointData('war'), 6000);  
getEndpointData('war')
