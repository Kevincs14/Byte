let checker;

// Import the DateTime class from the Luxon library for date and time handling
import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@3.1.0/build/es6/luxon.min.js';


// Event listener for the button click
document.querySelector(".button").addEventListener('click', async function() {
  
  // If there's an ongoing interval (perhaps from a previous search), clear it
  if (checker) {
    clearInterval(checker);
  }

  // Get the user input from the search bar and convert it to lowercase
  const userChoice = document.querySelector(".search-bar").value.toLowerCase();
  
  if (!userChoice) {
    alert("Error: enter a city");
    return;
  }

   // Fetch and process the background image
   Getbackground(userChoice)
   .then(userBackground => {
     if (userBackground === null) {
       alert("Error: City data not found.");
       return; // Exit the function if background data is not found
     }

    // Check if the user input is empty
    document.getElementById("loading-Screen").style.display = "flex"; // Display loading screen
    document.getElementById("main-content").style.display = "none";  // Hide main content

    // Set the background image for the user screen
    document.getElementById("user-screen").style.backgroundImage = `url(${userBackground})`;

    // Hide the loading screen and show the user screen after a delay
    setTimeout(() => {
      document.getElementById("loading-Screen").style.display = "none"; // Hide the loading screen
      document.getElementById("user-screen").style.display = "flex"; // Show the user screen
    }, 4000); // Delay of 4000 milliseconds (4 seconds)

    // Set an interval to update the region time every second
    checker = setInterval(() => GetRegion(userChoice), 1000);
  })

});

// Function to get the background image based on user choice
async function Getbackground(userChoice) {
    // Fetch the city images data from the JSON file
    const response = await fetch('cityimages.json');
    const Cityimages = await response.json(); // Parse the JSON data

    // Get the timezone for the user choice
    const timezone = await getTimezone(userChoice);

    if (timezone === "fail") {
      alert("Error: City data not found."); // Alert if no valid timezone
      return null; // Return null if timezone fetch fails
    }
    // Determine the region based on the timezone
    const Region = RegionFromTimezone(timezone);
    const RegionImages = Cityimages[Region]; // Get images for the determined region

    // Return the specific image for the user choice or a default image if not found
    return RegionImages[userChoice] || RegionImages['default'];

  } 


// Function to fetch and display the current time in the user's city
async function GetRegion(userChoice) {
    // Fetch the geocoding data for the user choice
    const fetching = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${userChoice}&count=1&language=en&format=json`);
    const data = await fetching.json(); // Parse the JSON data
    console.log(data); // Log the fetched data for debugging

    if (!data.results || data.results.length === 0)  {
      alert("City not found");
      return; // Exit if no results are found
    }

    // Extract the timezone from the data
    const timezone = data.results[0].timezone;
    console.log(timezone); // Log the timezone for debugging

    // Get the current time in the extracted timezone
    const now = DateTime.now().setZone(timezone);
    const formattedTime = now.toFormat("hh:mm:ss a"); // Format the time
    console.log(`Time in ${timezone}: ${formattedTime}`); // Log the formatted time for debugging

    // Display the formatted time on the page
    document.querySelector(".clock").textContent = formattedTime;

  } 


// Function to get the timezone for the user choice
async function getTimezone(userChoice) {
    // Fetch the geocoding data for the user choice
    const fetching = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${userChoice}&count=1&language=en&format=json`);
    const data = await fetching.json(); // Parse the JSON data

    if (!data.results || data.results.length === 0)  {
      alert("City not found");
      return "fail"; // Return "fail" if no results are found
    }

    // Extract and return the timezone from the data
    return data.results[0].timezone;

  }

// Function to determine the region based on the timezone
  function RegionFromTimezone(timezone) {
    // Check the timezone to determine the region
    if (timezone.includes("America")) return "america";
    if (timezone.includes("Europe")) return "europe";
    if (timezone.includes("Asia")) return "asia";
    if (timezone.includes("Australia")) return "australia";
    if (timezone.includes("Africa")) return "africa";

    // Return a default region if none of the specified regions match
    return "default";
 }
