// Description: This file contains the code for the game.html page

// Global constants
const max_score = 5000; // Max score for each round
const start_score = 0; // Starting score
const start_map = 1; // Starting map
const base_radius = 1000; // Base radius for the Street View panorama search
const base_sigma = 1000; // Base sigma for the score calculation

const base_total_maps = 5; // Base total maps for the game
const base_timer = 60000; // Base timer for the game

// Global variables
let played; // Variable to check if the round has been played
let total_score = start_score; // Variable to store the total score
let map_score = start_score; // Variable to store the current score of the 
let current_map = start_map;
let radius = base_radius;
let map_found;
let latitude, longitude;
let map_location;
let guess_marker, target_marker, line_path, line_coordinates, random_coordinates, random_area;

// Variables for the gamemodes
let timer, seconds_left;;
let time_ms = base_timer;
/////////////////////
let move_enabled;
/////////////////////
let sigma; // Used for the score calculation (the higher the sigma the more forgiving the game is)
let total_maps;

let user_map = false;
let longitude_array = [];
let latitude_array = [];

function difficultyToNumber(difficultyLabel) {
    switch (difficultyLabel.toLowerCase()) {
        case "impossible":
            return 100;
        case "very hard":
            return 500;
        case "hard":
            return 1000;
        case "normal":
            return 1500;
        case "easy":
            return 2500;
        default:
            return 1500;
    }
}

///////////////////////////////////////////////////////////////////////
// Function to get query parameters from the URL
function getQueryParam(key) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(key);
}



function setVariables(){
    map_score = start_score; // Reset the score
    total_score = start_score; // Reset the total score
    current_map = start_map; // Reset the map
    played = false; // Reset the played variable
    // Game.html?custom=true 
    const custom = getQueryParam('custom');

    const id = getQueryParam('id');

    if (custom === "true") {
        timer = getQueryParam('timerActive');
        if (timer === "true") {
            timer = true;
            time_ms = parseInt(getQueryParam('timerDuration'));
        } else {
            timer = false;
        }
        move_enabled = getQueryParam('canMove');
        if (move_enabled === "true") {
            move_enabled = true;
        } else {
            move_enabled = false;
        }
        total_maps = getQueryParam('totalMaps');
        if (total_maps !== null && total_maps !== undefined && total_maps !== '') { // If totalMaps query is not empty
            total_maps =  parseInt(total_maps);
        } else {
            total_maps = base_total_maps;
        }
        sigma = parseInt(getQueryParam('sigma'));
    } else if (id !== null && id !== undefined && id !== '') { // if there is a game id
        console.log("Getting game data");
        game_id = id;
        var api_url = '/get_game/' + game_id + '/';

        // Fetch the game settings from the database
        fetch(api_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const gameData = JSON.parse(data.game);

                // Access different elements of the 'fields' property
                const mapTitle = gameData[0].fields.map_title;
                const difficulty = gameData[0].fields.difficulty;
                const timerDuration = gameData[0].fields.timer_duration;
                const timer_status = gameData[0].fields.timer_status;
                const canMove = gameData[0].fields.mobility;

                // Log or use the retrieved values
                console.log('Map Title:', mapTitle);
                console.log('Difficulty:', difficulty);
                console.log('Timer status:', timer_status);
                console.log('Timer Duration:', timerDuration);
                console.log('Can move:', canMove);

                timer = timer_status;
                time_ms = timerDuration * 1000;
                move_enabled = canMove;
                sigma = difficultyToNumber(difficulty);
                console.log("Sigma: " + sigma);

            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Fetch the locations from the database
        var api_url = `http://127.0.0.1:8000/get_locations_for_game/${game_id}/`;

        // Use the apiUrl for your fetch call
        fetch(api_url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                var locations = JSON.parse(data.locations);

                latitude_array = locations.map(function(location) {
                    return location.fields.latitude;
                });

                longitude_array = locations.map(function(location) {
                    return location.fields.longitude;
                });

                user_map = true;
                total_maps = latitude_array.length;
            })
            .catch(error => {
                console.error('Error:', error);
            });

    } else {
        timer = true;
        time_ms = base_timer;
        move_enabled = true;
        total_maps = base_total_maps;
        sigma = base_sigma;
        map_found = false;
    }
}
///////////////////////////////

function toggleLoader(on) {

    var loaders = document.querySelectorAll('.loader');
    var buttons = document.querySelectorAll('.custom-button');

    if (on) {
        loaders.forEach(function (loader) {
            loader.style.display = 'block';
        });

        buttons.forEach(function (button) {
            button.style.display = 'none';
        });
    } else {
        loaders.forEach(function (loader) {
            loader.style.display = 'none';
        });

        buttons.forEach(function (button) {
            button.style.display = 'block';
        });
    }
}


function mapFoundTest() {
    if (map_found === true) {
        toggleLoader(false);
        newMap();
        const map_element = document.getElementById("currentMap");
        map_element.innerHTML = `<strong> Round: </strong> ${current_map}/${total_maps}`;   
        const score_element = document.getElementById("currentScore");
        score_element.innerHTML = `<strong> Score: </strong>  ${total_score}`;
        var modal = document.getElementById('id02');
        modal.style.display = "none";
        start = false;
        var modal = document.getElementById('id01');
        modal.style.display = "none";
        
    } else {
        setTimeout(mapFoundTest, 1000);
    }
}

function playAgain() {
    if (current_map !== total_maps) {
        toggleLoader(true);
        if (played === true) {
            played = false;
            map_found = false;
            /////////////////////////////
            current_map += 1;
            /////////////////////////////
            initStreetView(true);
            mapFoundTest();
        }
    } else { // If the game is over
        map_found = false;
        startGame();
    }
}

function redirectToSettings() {
    const button = document.getElementById('back1');
    const url = button.getAttribute('data-url');
    window.location.href = url;
}

// Get the user's location
var user_lon = 0;
var user_lat = 0;
var zoom = 0;

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
function showPosition(position) {
user_lat = position.coords.latitude;
user_lon = position.coords.longitude;
zoom = 8;
}

getLocation();

function startGame() {
    console.log("Starting game");
    document.getElementById("playButton").value = "Play Again";
    setVariables();
    toggleLoader(true);
    start = true;
    initStreetView(true);
    mapFoundTest();
}


function showModal() {
    console.log("current map: " + current_map);
    console.log("total maps: " + total_maps);
    document.getElementById('id01').style.display = 'block';

    if (current_map === total_maps) {
        console.log("Game over");
        document.getElementById("playButton").value = "Start New Game";
    }

    const map_element = document.getElementById("current-map-modal");
    map_element.innerHTML = `<strong> Map overview </strong> ${current_map}/${total_maps}`;

    const score_element = document.getElementById("current-score-modal");
    score_element.innerHTML = `<strong> Score: <span id="total-score">${total_score - map_score}</span> + <span id="current-score">${map_score}/${max_score}</span></strong>`;

    setTimeout(() => {
        score_element.classList.add("combine-scores");
    }, 2000);

    setTimeout(() => {
        score_element.innerHTML = `<strong> Score: <span id="total-score"> ${total_score}</span></strong>`;
        score_element.classList.remove("combine-scores");
    }, 3000);
}

//Weather API from https://openweathermap.org/api
function showLocalinfo(latitude, longitude) {
    const api_key = '9becfeed140c9639fe192941f0633492';
    const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric`;
    const location_info_element = document.getElementById('locationInfo');

    showModal();

    fetch(api_url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Handle the weather data here
            const country_code = data.sys.country;
            const country_flag = `https://flagsapi.com/${country_code}/flat/64.png`;
            const city = data.name;
            const description = data.weather[0].description;
            const temperature = `${data.main.temp}°C`;
            const icon = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";

            location_info_element.innerHTML = `
                <p>Welcome to <strong>${city}</strong> <img src="${country_flag}" alt="${country_code}" style="width: 64px; height: 64px;"> 
                <br> </br>
                <strong>${temperature}</strong> <img src="${icon}" style="width: 80px; height: 80px;"> </p>
                <p>from openweathermap <img src="https://pbs.twimg.com/profile_images/1173919481082580992/f95OeyEW_400x400.jpg" style="width: 15px; height: 15px;"> </p>
            `;
            location_info_element.style.opacity = 0.85;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            // Handle the error, display an error message, or take appropriate action
        });
}


// https://stackoverflow.com/questions/65351282/based-on-distance-away-from-a-coordinate-generate-score-lower-distance-away
function calculateScore(distance) {
    // the higher the sigma the more forgiving the game is
    map_score = Math.round(max_score * Math.exp(-0.5 * (distance / (sigma / 8)) ** 2));
}

// const AREA = [[upleftY, upleftX],[uprightY, uprightX],[downrightY, downrightX],[downleftY, downleftX]];
// weights will be the area of earth divided by the area of that area
const areaOfEarth = 153030000;

const continents = {
    Scandinavia: {
        weight: 2417901.60 / areaOfEarth,
        coordinates: [
            [71.14084246427528, 5.034565097476516],
            [71.30034606248509, 32.18062094906504],
            [54.78296177431897, 31.932654747289646],
            [55.069205013862124, 4.539078297062521],
        ],
    },
    Iceland: {
        weight: 190883.29 / areaOfEarth,
        coordinates: [
            [66.51924679143653, -24.638559481991866],
            [66.5329835378412, -13.300064245743673],
            [63.3100828692601, -13.269474527556316],
            [63.29644943582654, -24.64213384165604],
        ],
    },
    EuropeMainLand: {
        weight: 8509244.32 / areaOfEarth,
        coordinates: [
            [58.82120051117042, -10.19889105971192],
            [58.76715539096427, 39.240253055989676],
            [36.856141469642594, 39.2424457522243],
            [37.13222554355153, -10.124650104618762],
        ],
    },
    CanaryIslands: {
        weight: 85677.20 / areaOfEarth,
        coordinates: [
            [29.258488255121286, -18.224358355185416],
            [29.292993906896275, -13.404653644679778],
            [27.6433654296633, -13.456290467628833],
            [27.622888515039058, -18.230282056307285],
        ],
    },
    NorthAfrica: {
        weight: 17950200.79 / areaOfEarth,
        coordinates: [
            [34.26839092120326, -16.87370216328901],
            [32.87508627991171, 34.445690851542615],
            [4.736066478803184, 34.759251297661756],
            [5.152590451691534, -17.918903650352792],
        ],
    },
    HornOfAfrica: {
        weight: 3188423.24 / areaOfEarth,
        coordinates: [
            [11.971662709145162, 33.958313045371035],
            [11.971662709145162, 51.53643671916674],
            [-2.52928611412382, 51.88799919264265],
            [-2.52928611412382, 33.958313045371035],
        ],
    },
    SouthAfrica: {
        weight: 13038281.14 / areaOfEarth,
        coordinates: [
            [-1.3675028286942212, 8.421060488982992],
            [-1.8898906611289705, 42.39010881855585],
            [-34.41688824321809, 42.181068521143104],
            [-34.589157463272436, 9.048181381221264],
        ],
    },
    Madagascar: {
        weight: 2971404.54 / areaOfEarth,
        coordinates: [
            [-10.847488407040432, 42.80651522994556],
            [-10.956347988960186, 59.21384834438676],
            [-26.373267776085562, 59.1768948914263],
            [-26.14128471714805, 42.621747965143285],
        ],
    },
    MiddleEast: {
        weight: 8862414.40 / areaOfEarth,
        coordinates: [
            [36.92862346119149, 34.825132589008064],
            [36.99884948801137, 69.62981746312354],
            [13.81224173292221, 69.27825498964764],
            [14.323767416895159, 35.17669506248398],
        ],
    },
    AsiaMainLand: {
        weight: 17676417.52 / areaOfEarth,
        coordinates: [
            [63.02637770782962, 34.397860637633194],
            [63.22682150351833, 134.31999744269888],
            [34.56213948241478, 128.55525878086817],
            [36.486770753509, 34.54567444947501],
        ],
    },
    SouthAsia: {
        weight: 6033971.90 / areaOfEarth,
        coordinates: [
            [29.710208926569106, 70.80438972927725],
            [29.63384311888109, 91.98602875620105],
            [5.991122200789377, 92.07391937457004],
            [5.8162733354206635, 70.1891554006944],
        ],
    },
    China: {
        weight: 6528543.87 / areaOfEarth,
        coordinates: [
            [38.0773918055009, 92.30102912919395],
            [38.138861058426684, 123.62752091050231],
            [19.225191196681777, 123.94000461904405],
            [18.929870368855962, 92.2229082020585],
        ],
    },
    KoreaJapan: {
        weight: 3043807.10 / areaOfEarth,
        coordinates: [
            [46.27923647779601, 125.26623189749401],
            [46.27923647779601, 145.8440165646783],
            [30.88047530537524, 145.37950675277798],
            [30.60100700336596, 125.26623189749401],
        ],
    },
    SouthEastAsia: {
        weight: 14090205.70 / areaOfEarth,
        coordinates: [
            [20.640847756994816, 91.69960669878705],
            [20.640847756994816, 126.5097593875339],
            [-11.486757781365126, 127.10101463490119],
            [-11.486757781365126, 91.84742051062885],
        ],
    },
    AustraliaMainLand: {
        weight: 12657201.17 / areaOfEarth,
        coordinates: [
            [-11.388585409286607, 112.82548543009061],
            [-10.957462565613936, 153.95829482677254],
            [-38.44075461807483, 153.78251359003457],
            [-38.989374341415264, 113.6165009954114],
        ],
    },
    Tasmania: {
        weight: 103621.70 / areaOfEarth,
        coordinates: [
            [-40.67081455786152, 144.52413571834464],
            [-40.701003913327746, 148.3461037562941],
            [-43.59293574381843, 148.42572809041806],
            [-43.66497816379444, 144.5639478854066],
        ],
    },
    NewZealand: {
        weight: 1485709.42 / areaOfEarth,
        coordinates: [
            [-34.513888885458215, 166.04621354872063],
            [-34.47486807170346, 178.5452704048375],
            [-47.357562477241956, 178.59261531717132],
            [-47.29337860640742, 166.23559319805574],
        ],
    },
    Greenland: {
        weight: 3554469.57 / areaOfEarth,
        coordinates: [
            [79.95069876351401, -65.79252415542695],
            [80.07265252113781, -23.253464864840904],
            [58.76651672853134, -23.077683628102942],
            [58.67524982382153, -63.68314931457145],
        ],
    },
    NorthAmericaMainLand: {
        weight: 20890866.90 / areaOfEarth,
        coordinates: [
            [70.1060979309805, -132.09658369580458],
            [70.6898481390013, -61.49639633823274],
            [28.836491563498498, -61.74498854723828],
            [28.836491563498498, -131.10221485978244],
        ],
    },
    Alaska: {
        weight: 3097313.91 / areaOfEarth,
        coordinates: [
            [71.08431749178665, -165.80448293849207],
            [70.92247891270657, -131.2501658867228],
            [54.360248416618305, -132.12023861824218],
            [54.28775883066582, -165.92877904299482],
        ],
    },
    Mexico: {
        weight: 1912253.26 / areaOfEarth,
        coordinates: [
            [28.869903535868485, -108.2313370578962],
            [29.023724245377217, -96.01454110460818],
            [15.735392341465623, -95.5750880127633],
            [15.481444127551097, -108.40711829463416],
        ],
    },
    Guatemala: {
        weight: 832379.07 / areaOfEarth,
        coordinates: [
            [21.703437463912234, -94.87849759879659],
            [21.70343746391225, -86.83380302700942],
            [12.821938877206428, -86.96049113050213],
            [13.130570721094937, -95.06852975403564],
        ],
    },
    Panama: {
        weight: 211133.66 / areaOfEarth,
        coordinates: [
            [9.841056806074487, -83.6665996368072],
            [9.716209334566162, -77.45888256566438],
            [6.958805525477372, -77.64891472090345],
            [6.958805525477372, -83.6665996368072],
        ],
    },
    DominicanRepublic: {
        weight: 57191.02 / areaOfEarth,
        coordinates: [
            [19.889153100340057, -70.85724832916344],
            [19.876866899669405, -68.1789195185625],
            [18.060697382433588, -68.15278948138591],
            [18.035853051338975, -70.80498825481025],
        ],
    },
    PuertoRico: {
        weight: 12031.64 / areaOfEarth,
        coordinates: [
            [18.52859363935658, -67.2484958735337],
            [18.52122765284481, -65.57826696927778],
            [17.90875516136354, -65.59380398234062],
            [17.90875516136354, -67.2484958735337],
        ],
    },
    VirginIslands: {
        weight: 6912.29 / areaOfEarth,
        coordinates: [
            [18.522672542801782, -65.03847034700321],
            [18.522672542801782, -64.35484177223798],
            [17.65869827486907, -64.35484177223798],
            [17.65129566466105, -65.02681758720607],
        ],
    },
    FrenchAntilles: {
        weight: 44022.58 / areaOfEarth,
        coordinates: [
            [16.509217947494847, -61.8230405133189],
            [16.509217947494847, -60.83453564662678],
            [12.926853776546748, -60.7791054671861],
            [12.944861588390244, -61.85075560303924],
        ],
    },
    NorthOfSouthAmerica: {
        weight: 19439522.23 / areaOfEarth,
        coordinates: [
            [11.916899850639044, -81.73975420181262],
            [11.74485278746788, -35.5092889397299],
            [-20.585388428841615, -35.15772646625399],
            [-21.078256853393697, -81.91553543855056],
        ],
    },
    MiddleOfSouthAmerica: {
        weight: 6905291.84 / areaOfEarth,
        coordinates: [
            [-18.56274384611329, -72.3529821642851],
            [-17.97852882361089, -39.39400027591817],
            [-37.09006815646181, -39.56978151265612],
            [-37.09006815646182, -73.23188834797489],
        ],
    },
    SouthOfSouthAmerica: {
        weight: 1787154.89 / areaOfEarth,
        coordinates: [
            [-39.63621149105558, -75.76244806273877],
            [-39.77144992188392, -62.66674592576097],
            [-55.67514877205936, -62.13940221554711],
            [-55.675148772059345, -76.20190115458367],
        ],
    },
    Hawaii: {
        weight: 223829.42 / areaOfEarth,
        coordinates: [
            [22.418182065624222, -160.27214494653106],
            [22.377551979794113, -154.82292660765438],
            [18.89281949189007, -154.76799497117378],
            [18.840839181664133, -160.27214494653106],
        ],
    },
};

function getRandomArea() {
    const total_weight = Object.values(continents).reduce((sum, continent) => sum + continent.weight, 0);
    let random_weight = Math.random() * total_weight;

    for (const continentName in continents) {
        const continent = continents[continentName];
        random_weight -= continent.weight;
        if (random_weight <= 0) {
            return continent.coordinates;
        }
    }
}

function getrandomCoordinates(area) {
    // Extracting bounds
    const [upleft, upright, downright, downleft] = area;
    const [upleftY, upleftX] = upleft;
    const [uprightY, uprightX] = upright;
    const [downrightY, downrightX] = downright;
    const [downleftY, downleftX] = downleft;

    // Generating random coordinates
    const latitude = Math.random() * (Math.min(upleftY, downrightY) - Math.max(uprightY, downleftY)) + Math.max(uprightY, downleftY);
    const longitude = Math.random() * (Math.min(uprightX, upleftX) - Math.max(downrightX, downleftX)) + Math.max(downrightX, downleftX);
    return { latitude, longitude };
}
// Get random coordinates
function randomCoordinates() {
    const latitude = Math.random() * 180 - 90;
    const longitude = Math.random() * 360 - 180;
    return { latitude, longitude };
}

// Function to find  the nearest Street View panorama
function findNearestStreetView(latitude, longitude) {
    const street_view_service = new google.maps.StreetViewService();
    const street_view_location = { lat: latitude, lng: longitude };
    street_view_service.getPanorama(
        { location: street_view_location, radius: radius, source: google.maps.StreetViewSource.OUTDOOR, preference: google.maps.StreetViewPreference.NEAREST },
        (data, status) => {
            if (status === "OK") {
                map_location = data.location;
                const panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("pano"),
                    {
                        pano: map_location.pano,
                        pov: {
                            heading: 0,
                            pitch: 0,
                            zoom: 0
                        },
                        linksControl: false,
                        panControl: false,
                        enableCloseButton: false,
                        addressControl: false,
                        zoomControl: false,
                        fullscreenControl: false,
                        showRoadLabels: false,
                        clickToGo: move_enabled,
                    }
                );
                map_found = true;
                map.setStreetView(panorama);
            } else {
                map_found = false;
                radius += base_radius;
                console.log("Retry");
                initStreetView(false);
            }
        }
    );
}

function initStreetView(newArea) {
    console.log(user_map)
    if (user_map === true) {
        latitude = latitude_array[current_map - 1];
        longitude = longitude_array[current_map - 1];

        findNearestStreetView(latitude, longitude);
    } else {
        random_number = Math.random();
        if (random_number < 0.0) {
            // 10% of an actual random coordinate in the whole world
            random_coordinates = randomCoordinates();
        } else {
            // 90% chance for a coordinate in the defined Areas
            if (newArea === true) {
                random_area = getRandomArea();
            }
            random_coordinates = getrandomCoordinates(random_area);
        }
        latitude = random_coordinates.latitude;
        longitude = random_coordinates.longitude;
        findNearestStreetView(latitude, longitude);
    }
}

// Update the countdown every second
const countdown_element = document.getElementById("countdown");

function updateCountdown() {
    if (!played) {
        const minutes = Math.floor(seconds_left / 60);
        const seconds = seconds_left % 60;
        countdown_element.innerHTML = `<strong>Time Left:</strong> ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        seconds_left--;

        if (seconds_left >= 0 && played === false) {
            setTimeout(updateCountdown, 1000); // Update the countdown every second
        } else {
            played = true;

            const time_up = new google.maps.InfoWindow({});

            showLocalinfo(map_location.latLng.lat(), map_location.latLng.lng());

            target_lat_lng = new google.maps.LatLng(map_location.latLng.lat(), map_location.latLng.lng());
            target_marker = new google.maps.Marker({
                position: target_lat_lng,
                draggable: false,
                icon: 'static/images/blackMarker.png',
                anchor: new google.maps.Point(15, 15),
            });

            target_marker.setMap(map);
            time_up.open(map, target_marker);
            time_up.setContent("Time's up! Play Again!")
        }
    }
}

function newMap() {

    radius = base_radius; // Reset the radius

    // Makes it so the opacity and size changes when hovering on and off the world map
    const map_div = document.getElementById("floating-panel")
    map_div.addEventListener("mouseover", () => {
        map_div.style.opacity = 0.8;
        map_div.style.height = "35%";
        map_div.style.width = "40%";
        map_div.style.top = "65%";
        map_div.style.left = "60%";
    });

    map_div.addEventListener("mouseout", () => {
        map_div.style.opacity = 0.5;
        map_div.style.height = "30%";
        map_div.style.width = "35%";
        map_div.style.top = "70%";
        map_div.style.left = "65%";
    });
    /////////////////////////////////////////////////////////////////////////

    seconds_left = time_ms / 1000;

    if (map_found === false) { // if a map has been found already, don't generate a new one
        initStreetView(true);
    }


    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: user_lat,  lng: user_lon },
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        minZoom: 1,
        restriction: {
            latLngBounds: {
                north: 80,
                south: -80,
                east: 180,
                west: -180,
            },
        },
    });

    if (current_map === 1) {
    my_info_window_lat_lng = new google.maps.LatLng(user_lat, user_lon);
    my_info_window = new google.maps.InfoWindow({
        position: my_info_window_lat_lng,
        content: "Zoom in and double click the map to make your guess!",
    });

    my_info_window.open(map);
    }

    if (timer) { // if a map has been found and timer is enabled, start the timer
        updateCountdown();
    }

    map.addListener("dblclick", (mapsMouseEvent) => {

        if (played === true) {
            return;
        }

        guess_lat_lng = new google.maps.LatLng(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());

        guess_marker = new google.maps.Marker({
            position: mapsMouseEvent.latLng,
            title: "Hello World!",
            optimized: true
        });

        guess_marker.setMap(map);

        target_lat_lng = new google.maps.LatLng(map_location.latLng.lat(), map_location.latLng.lng());
        target_marker = new google.maps.Marker({
            position: target_lat_lng,
            draggable: false,
            icon: 'static/images/blackMarker.png',
            anchor: new google.maps.Point(15, 15),
        });

        target_marker.setMap(map);

        distance = google.maps.geometry.spherical.computeDistanceBetween(guess_lat_lng, target_lat_lng) / 1000;

        const distance_info_window = new google.maps.InfoWindow({
        });

        distance_info_window.setContent("You were only " + distance.toFixed(1) +  "km away!")
        distance_info_window.open(map, target_marker);

        line_coordinates = [
            target_lat_lng,
            guess_lat_lng,
        ];

        line_path = new google.maps.Polyline({
            path: line_coordinates,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        line_path.setMap(map);
        played = true;
        calculateScore(distance);

        total_score += map_score;
        const score_element = document.getElementById("currentScore");
        score_element.innerHTML = `<strong> Score: </strong>  ${total_score}`;
        showLocalinfo(map_location.latLng.lat(), map_location.latLng.lng());

    });

}