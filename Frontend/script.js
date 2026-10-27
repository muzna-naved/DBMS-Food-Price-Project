// =========================
// API URL
// =========================

// address where Flask API is running
const API_URL = "https://dbms-food-price-project.vercel.app";

// Format the API date 
function formatDate(dateString) {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// =========================
// GET HTML ELEMENTS
// =========================

// city dropdown
const citySelect = document.getElementById("citySelect");

// product dropdown 
const productSelect = document.getElementById("productSelect");

// button
const loadPricesBtn = document.getElementById("loadPricesBtn");

// table body
const priceTableBody = document.getElementById("priceTableBody");

// search box
const searchInput = document.getElementById("searchInput");


// =========================
// STORE PRICE DATA
// =========================

// store all price records
let allPrices = [];

// store  price comparison chart
let priceChart = null;

// =========================
// LOAD CITIES
// =========================

async function loadCities() {

    try {

        // Flask API for all cities
        const response = await fetch(`${API_URL}/api/cities`);

        // Convert response into JSON
        const cities = await response.json();

        // Add each city to the dropdown
        cities.forEach(city => {

            const option = document.createElement("option");

            option.value = city.city_name;

            option.textContent = city.city_name;

            citySelect.appendChild(option);

        });

    } catch (error) {

        console.error("Error loading cities:", error);

    }
}


// =========================
// LOAD PRODUCTS
// =========================

async function loadProducts() {

    try {

        // Flask API for all products
        const response = await fetch(`${API_URL}/api/products`);

        // Convert the response into JSON
        const products = await response.json();

        // Add each product to the dropdown
        products.forEach(product => {

            const option = document.createElement("option");

            option.value = product.product_name;

            option.textContent = product.product_name;

            productSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Error loading products:", error);

    }
}


// =========================
// LOAD ALL PRICE DATA
// =========================

async function loadPrices() {

    try {

        // Flask API for all price records
        const response = await fetch(`${API_URL}/api/prices`);

        // Convert the response into JSON
        allPrices = await response.json();

        // Show the price data in the table
        displayPrices(allPrices);
        // Load products into the City Comparison dropdown
        loadComparisonProducts();

    } catch (error) {

        console.error("Error loading prices:", error);

        priceTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load price data.
                </td>
            </tr>
        `;

    }
}


// =========================
// DISPLAY PRICE TABLE
// =========================

function displayPrices(prices) {

    // Clear the existing table
    priceTableBody.innerHTML = "";

    // If no records are found
    if (prices.length === 0) {

        priceTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No price records found.
                </td>
            </tr>
        `;

        return;
    }


    // Add every price record to the table
    prices.forEach(price => {

        const row = document.createElement("tr");

       row.innerHTML = `
    <td>${price.product_name}</td>
    <td>${price.unit}</td>
    <td>${price.city_name}</td>
    <td>${price.province}</td>
    <td>${formatDate(price.record_date)}</td>
    <td>Rs. ${Number(price.min_price).toFixed(2)}</td>
    <td>Rs. ${Number(price.avg_price).toFixed(2)}</td>
    <td>Rs. ${Number(price.max_price).toFixed(2)}</td>
    `;

        priceTableBody.appendChild(row);

    });
}


// =========================
// SHOW SELECTED PRICE
// =========================

function showSelectedPrice() {

    const selectedCity = citySelect.value;

    const selectedProduct = productSelect.value;


    // Make sure both selections are made
    if (!selectedCity || !selectedProduct) {

        alert("Please select both a city and a product.");

        return;
    }


    // Find the matching record
    const selectedPrice = allPrices.find(price =>
        price.city_name === selectedCity &&
        price.product_name === selectedProduct
    );


    // If no matching record is found
    if (!selectedPrice) {

        document.getElementById("minPrice").textContent = "Rs. -";
        document.getElementById("avgPrice").textContent = "Rs. -";
        document.getElementById("maxPrice").textContent = "Rs. -";

        document.getElementById("infoProduct").textContent = "-";
        document.getElementById("infoUnit").textContent = "-";
        document.getElementById("infoCity").textContent = "-";

        alert("No price data found for this selection.");

        return;
    }


    // Show minimum price
    document.getElementById("minPrice").textContent =
        `Rs. ${Number(selectedPrice.min_price).toFixed(2)}`;


    // Show average price
    document.getElementById("avgPrice").textContent =
        `Rs. ${Number(selectedPrice.avg_price).toFixed(2)}`;


    // Show maximum price
    document.getElementById("maxPrice").textContent =
        `Rs. ${Number(selectedPrice.max_price).toFixed(2)}`;


    // Show product information
    document.getElementById("infoProduct").textContent =
        selectedPrice.product_name;

    document.getElementById("infoUnit").textContent =
        selectedPrice.unit;

    document.getElementById("infoCity").textContent =
        selectedPrice.city_name;


    // Update small text below the price cards
    document.getElementById("minInfo").textContent =
        selectedPrice.city_name;

    document.getElementById("avgInfo").textContent =
        selectedPrice.city_name;

    document.getElementById("maxInfo").textContent =
        selectedPrice.city_name;

    // Create a chart showing product's price across all cities
    createPriceChart(selectedProduct);
}


// =========================
// SEARCH TABLE
// =========================

function searchPrices() {

    // text entered by the user
    const searchText = searchInput.value.toLowerCase();


    // Filter the price records
    const filteredPrices = allPrices.filter(price =>

        price.product_name.toLowerCase().includes(searchText) ||

        price.city_name.toLowerCase().includes(searchText) ||

        price.province.toLowerCase().includes(searchText)

    );


    // Display filtered results
    displayPrices(filteredPrices);
}


// =========================
// BUTTON EVENT
// =========================

// When the user clicks Get Latest Prices
loadPricesBtn.addEventListener("click", showSelectedPrice);


// =========================
// SEARCH EVENT
// =========================

// Search whenever the user types
searchInput.addEventListener("input", searchPrices);

// =========================
// CREATE PRICE CHART
// =========================

function createPriceChart(productName) {

    // Find all cities for the selected product
    const productPrices = allPrices.filter(price =>
        price.product_name === productName
    );

    // city names
    const cities = productPrices.map(price =>
        price.city_name
    );

    // average prices
    const averagePrices = productPrices.map(price =>
        Number(price.avg_price)
    );

    // Find the chart canvas
    const chartCanvas = document.getElementById("priceChart");

    // If a chart already exists, remove it first
    if (priceChart) {
        priceChart.destroy();
    }

    // Create the new chart
    priceChart = new Chart(chartCanvas, {

        type: "bar",

        data: {

            labels: cities,

            datasets: [

                {
                    label: "Average Price",

                    data: averagePrices,

                    // Main bar color
                    backgroundColor: "rgba(47, 112, 77, 0.75)",

                    // Border around bars
                    borderColor: "#2f704d",

                    borderWidth: 1,

                    // Rounded corners
                    borderRadius: 7,

                    // Prevent bars from becoming too wide
                    barPercentage: 0.70,

                    categoryPercentage: 0.80
                }

            ]
        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            // Smooth animation
            animation: {

                duration: 700,

                easing: "easeOutQuart"
            },


            // Hover interaction
            interaction: {

                mode: "index",

                intersect: false
            },


            plugins: {

                // Remove the legend because the chart has only one dataset
                legend: {

                    display: false
                },


                // Tooltip shown when hovering over a bar
                tooltip: {

                    backgroundColor: "#183d2b",

                    titleColor: "#ffffff",

                    bodyColor: "#ffffff",

                    padding: 12,

                    cornerRadius: 8,

                    displayColors: false,

                    callbacks: {

                        title: function(context) {

                            return context[0].label;

                        },

                        label: function(context) {

                            return "Average Price: Rs. " +
                                Number(context.raw).toLocaleString(
                                    "en-PK",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                );
                        }
                    }
                }
            },


            scales: {

                // Y axis
                y: {

                    beginAtZero: true,

                    border: {
                        display: false
                    },

                    grid: {

                        color: "rgba(24, 61, 43, 0.08)",

                        drawTicks: false
                    },

                    ticks: {

                        color: "#718078",

                        padding: 10,

                        callback: function(value) {

                            return "Rs. " +
                                Number(value).toLocaleString("en-PK");
                        }
                    },

                    title: {

                        display: true,

                        text: "Average Price (Rs.)",

                        color: "#53635a",

                        font: {

                            size: 12,

                            weight: "600"
                        }
                    }
                },


                // X axis
                x: {

                    border: {
                        display: false
                    },

                    grid: {

                        display: false
                    },

                    ticks: {

                        color: "#65736b",

                        font: {

                            size: 11
                        },

                        maxRotation: 45,

                        minRotation: 30,

                        autoSkip: false
                    },

                    title: {

                        display: true,

                        text: "Cities",

                        color: "#53635a",

                        font: {

                            size: 12,

                            weight: "600"
                        }
                    }
                }
            }
        }
    });
}

// =========================
// PRICE ANALYTICS NAVIGATION
// =========================

function goToPriceAnalytics(event) {

    // Stop the normal link behavior
    event.preventDefault();

    // Find the Price Analytics section
    const analyticsSection =
        document.getElementById("priceAnalytics");

    // Scroll smoothly to the section
    if (analyticsSection) {

        analyticsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
}

// =========================
// CHANGE ACTIVE SIDEBAR ITEM
// =========================

function setActiveNav(clickedItem) {

    // Get all sidebar navigation items
    const navItems = document.querySelectorAll(".nav-item");

    // Remove active class from all items
    navItems.forEach(item => {
        item.classList.remove("active");
    });

    // Add active class to the item that was clicked
    clickedItem.classList.add("active");
}

// =========================
// LOAD PRODUCT FOR COMPARISON
// =========================

function loadComparisonProducts() {

    const comparisonProduct =
        document.getElementById("comparisonProduct");


    // Clear existing options except the first one
    comparisonProduct.innerHTML = `
        <option value="">
            Select a product
        </option>
    `;


    // Add all products from our price data
    const productNames = [
        ...new Set(
            allPrices.map(price => price.product_name)
        )
    ];


    productNames.forEach(productName => {

        const option =
            document.createElement("option");

        option.value = productName;

        option.textContent = productName;

        comparisonProduct.appendChild(option);

    });
}

// =========================
// COMPARE PRODUCT ACROSS CITIES
// =========================

function compareProductAcrossCities() {

    const selectedProduct =
        document.getElementById("comparisonProduct").value;


    // Make sure a product was selected
    if (!selectedProduct) {

        alert("Please select a product first.");

        return;

    }


    // Find all cities for this product
    const productPrices = allPrices.filter(price =>
        price.product_name === selectedProduct
    );


    // If no data exists
    if (productPrices.length === 0) {

        alert("No price data found for this product.");

        return;

    }


    // Find the city with the lowest average price
    const lowest = productPrices.reduce(
        (a, b) =>
            Number(a.avg_price) <
            Number(b.avg_price)
                ? a
                : b
    );


    // Find the city with the highest average price
    const highest = productPrices.reduce(
        (a, b) =>
            Number(a.avg_price) >
            Number(b.avg_price)
                ? a
                : b
    );


    // Calculate price difference
    const difference =
        Number(highest.avg_price) -
        Number(lowest.avg_price);


    // Show lowest price information
    document.getElementById("lowestCity").textContent =
        lowest.city_name;

    document.getElementById("lowestPrice").textContent =
        `Rs. ${Number(lowest.avg_price).toLocaleString(
            "en-PK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;


    // Show highest price information
    document.getElementById("highestCity").textContent =
        highest.city_name;

    document.getElementById("highestPrice").textContent =
        `Rs. ${Number(highest.avg_price).toLocaleString(
            "en-PK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;


    // Show price difference
    document.getElementById("priceDifference").textContent =
        `Rs. ${difference.toLocaleString(
            "en-PK",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;


    // Display the comparison table
    displayComparisonTable(productPrices);
}

// =========================
// DISPLAY COMPARISON TABLE
// =========================

function displayComparisonTable(prices) {

    const tableBody =
        document.getElementById("comparisonTableBody");


    // Clear the table
    tableBody.innerHTML = "";


    // Add each city
    prices.forEach(price => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${price.city_name}
            </td>

            <td>
                ${price.province}
            </td>

            <td>
                ${formatDate(price.record_date)}
            </td>

            <td>
                Rs. ${Number(price.min_price).toLocaleString(
                    "en-PK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

            <td>
                <strong>
                    Rs. ${Number(price.avg_price).toLocaleString(
                        "en-PK",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </strong>
            </td>

            <td>
                Rs. ${Number(price.max_price).toLocaleString(
                    "en-PK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

        `;


        tableBody.appendChild(row);

    });
}

// =========================
// CITY COMPARISON BUTTON
// =========================

document
    .getElementById("compareProductBtn")
    .addEventListener(
        "click",
        compareProductAcrossCities
    );

// =========================
// PRODUCT SEARCH
// =========================

function searchProducts() {

    // Get the text entered by the user
    const searchText =
        document.getElementById("productSearchInput")
        .value
        .trim()
        .toLowerCase();


    const resultsBody =
        document.getElementById("searchResultsBody");


    const resultInfo =
        document.getElementById("searchResultInfo");


    // Check if the search box is empty
    if (searchText === "") {

        resultInfo.textContent =
            "Please enter a product name to search.";

        resultsBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Please enter a product name.
                </td>
            </tr>
        `;

        return;
    }


    // Search our existing price data
    const results = allPrices.filter(price =>
        price.product_name
            .toLowerCase()
            .includes(searchText)
    );


    // If nothing was found
    if (results.length === 0) {

        resultInfo.textContent =
            `No products found for "${searchText}".`;

        resultsBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No matching products found.
                </td>
            </tr>
        `;

        return;
    }


    // Show number of results
    resultInfo.textContent =
        `Found ${results.length} price records for "${searchText}".`;


    // Clear previous results
    resultsBody.innerHTML = "";


    // Display each matching record
    results.forEach(price => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${price.product_name}
            </td>

            <td>
                ${price.unit}
            </td>

            <td>
                ${price.city_name}
            </td>

            <td>
                ${price.province}
            </td>

            <td>
                ${formatDate(price.record_date)}
            </td>

            <td>
            Rs. ${Number(price.min_price).toLocaleString(
                    "en-PK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

            <td>
                <strong>
                    Rs. ${Number(price.avg_price).toLocaleString(
                        "en-PK",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}
                </strong>
            </td>

            <td>
                Rs. ${Number(price.max_price).toLocaleString(
                    "en-PK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}
            </td>

        `;


        resultsBody.appendChild(row);

    });

}


// Search button
document
    .getElementById("searchProductBtn")
    .addEventListener(
        "click",
        searchProducts
    );

// Allow user to press Enter to search
document
    .getElementById("productSearchInput")
    .addEventListener("keypress", function(event) {

        if (event.key === "Enter") {
            searchProducts();
        }

    });

    // ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const navItems = document.querySelectorAll(".nav-item");

const sections = document.querySelectorAll(
    "#dashboard, #priceAnalytics, #cityComparison, #productSearch, #about"
);

navItems.forEach(function(item) {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        // Get the section we want to show
        const sectionId = item.getAttribute("data-section");

        // Hide all sections
        sections.forEach(function(section) {
            section.style.display = "none";
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.style.display = "block";
        }

        // Remove active class from all navigation buttons
        navItems.forEach(function(nav) {
            nav.classList.remove("active");
        });

        // Make clicked button active
        item.classList.add("active");

        // Move the main content to the top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});

// Show the current date
const currentDate = new Date();

document.getElementById("currentDate").textContent =
    currentDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

// Load cities
loadCities();

// Load products
loadProducts();

// Load all price records
loadPrices();