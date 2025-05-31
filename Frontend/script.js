let matchCounter = 0;
const count = document.getElementById("count");
count.textContent = matchCounter;

let currentUser = null;
let isLoggedin = false;
let firstLoad = true;
let alertResolve = null;
let alertTimeout = null;

let allBreedsWithDesc = [];
let breedmanager;
const restartButton = document.getElementById("restartButton");
const winRestartButton = document.getElementById("winRestartButton");
const loadingScreen = document.getElementById("loading-screen");
const createButton = document.getElementById("createButton");
const loginButton = document.getElementById("loginButton");
const openAuthPopupButton = document.querySelector(".openAuthPopup");


class Dog {
    constructor({ name, description }) {
        this.name = name;
        this.description = description;
    }
}

class DogbreedManager {
    constructor() {
        this.breeds = []
        this.instances = []
    }

    async fetchBreed() {
        let url = "http://localhost:8000/dogbreed";

        const response = await fetch(url);
        const data = await response.json();
        this.breeds = data;
        this.instances = [];

        for (let i = 0; i < data.length; i++) {
            const dogObj = new Dog(data[i]);
            this.instances.push(dogObj);
        }
    }

    get dogBreed() {
        return this._dogBreed
    }
    set dogBreed(value) {

        if (!this.breeds.some(b => b.name === value)) {
            console.log("error");
            return;
        }
        this._dogBreed = value;
    }
}


function updateCounterDisplay() {
    count.textContent = matchCounter;
}

function createCloseX(popupElement) {
    const closeX = document.createElement("div");
    closeX.textContent = "X";
    closeX.style.position = "absolute";
    closeX.className = "closeX";
    closeX.style.cursor = "pointer";
    closeX.style.fontSize = "20px";
    closeX.style.fontWeight = "bold";
    closeX.style.color = "white";
    popupElement.appendChild(closeX);

    closeX.addEventListener("click", function () {
        if (popupElement.classList.contains("popup")) {
            popupElement.classList.remove("show");
            popupElement.classList.remove("narrow");
        } else if (popupElement.parentElement.classList.contains("popup")) {
            popupElement.parentElement.classList.remove("show");
            popupElement.parentElement.classList.remove("narrow");
        }
        if (popupElement.id === "popupWin" || popupElement.parentElement.id === "popupWin") {
            document.getElementById("restartButton").style.display = "block";
        }
    });
}

const arrayDogFrase = ["Paws-itively brilliant!", "You sniffed out that match like a pro!", "You’ve got a nose for matches!", "Howl you do that? Amazing!", "You're fetching those pairs like a good pup!", "Tail wags for that one – well done!"];

function hideAlert() {
    document.getElementById("customAlert").classList.add("hidden");
    document.getElementById("alertOverlay").classList.add("hidden");
    document.body.style.overflow = "";
    if (alertTimeout) {
        clearTimeout(alertTimeout);
        alertTimeout = null;
    }
}

function showAlert(message) {
    const alertBox = document.getElementById("customAlert");
    const alertOverlay = document.getElementById("alertOverlay");
    document.getElementById("alertMessage").textContent = message;

    alertBox.classList.remove("hidden");
    alertOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    alertTimeout = setTimeout(() => {
        hideAlert();
    }, 3000);
}

document.getElementById("alertOkButton").addEventListener("click", hideAlert);

async function getDogPic() {
    if (firstLoad) {
        loadingScreen.classList.add("instant");
        loadingScreen.classList.add("show");

        setTimeout(() => {
            loadingScreen.classList.remove("instant");
        }, 50);

        firstLoad = false;
    } else {
        loadingScreen.classList.add("show");
    }

    let selectedImages = [];
    let allDogPics = [];

    const breeds = await getCommonBreeds();
    const breedsCopy = [...breeds];
    const selectedBreeds = [];

    for (let i = 0; i < 10 && breedsCopy.length > 0; i++) {
        const idx = Math.floor(Math.random() * breedsCopy.length);
        const chosen = breedsCopy[idx];
        selectedBreeds.push(chosen);
        breedsCopy.splice(idx, 1);
    }

    function toDogCeoApiBreed(breed) {
        const parts = breed.toLowerCase().split(" ");
        if (parts.length === 2) {
            return `${parts[1]}/${parts[0]}`;
        }
        return parts.join("-");
    }

    for (let i = 0; i < selectedBreeds.length; i++) {
        const breed = selectedBreeds[i];
        const apiBreed = toDogCeoApiBreed(breed);

        const response = await fetch(`http://localhost:8000/dogpic?breed=${apiBreed}`);
        const data = await response.json();

        allDogPics.push(data.message);
        allDogPics.push(data.message);
    }

    const shuffledPics = [];
    while (allDogPics.length > 0) {
        const index = Math.floor(Math.random() * allDogPics.length);
        const picked = allDogPics[index];
        shuffledPics.push(picked);
        allDogPics.splice(index, 1);
    }

    await preloadImages(shuffledPics);

    const cards = memoryContainer.querySelectorAll('.memoryCard');
    for (let i = 0; i < cards.length; i++) {
        memoryContainer.removeChild(cards[i]);
    }

    for (let i = 0; i < shuffledPics.length; i++) {
        const card = createCard(shuffledPics[i]);
        memoryContainer.appendChild(card);
    }

    loadingScreen.classList.remove("show");

    return selectedImages;
}

async function fetchAllBreedsWithDesc() {
    const response = await fetch("http://localhost:8000/dogbreed");
    allBreedsWithDesc = await response.json();
}

function getDescriptionFromImageUrl(imageUrl) {
    let breedName = extractBreedName(imageUrl);

    if (breedmanager && breedmanager.instances) {
        for (let i = 0; i < breedmanager.instances.length; i++) {
            let dog = breedmanager.instances[i];
            if (dog.name.toLowerCase() === breedName.toLowerCase()) {
                return dog.description;
            }
        }
    }
    return "Ingen beskrivning hittades.";
}

function getBreedFromImageUrl(imageUrl) {
    let breedName = extractBreedName(imageUrl);
    let words = breedName.split(" ");
    let capitalized = "";

    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        if (word.length > 0) {
            capitalized += word[0].toUpperCase() + word.slice(1);
        }
        if (i < words.length - 1) {
            capitalized += " ";
        }
    }
    return capitalized;
}

function extractBreedName(imageUrl) {
    const parts = imageUrl.split("/");

    const index = parts.indexOf("breeds");
    if (index !== -1 && index + 1 < parts.length) {
        const breedPart = parts[index + 1];
        const nameParts = breedPart.split("-");

        if (nameParts.length === 2) {
            return nameParts[1] + " " + nameParts[0];
        }

        let joinedName = "";
        for (let i = 0; i < nameParts.length; i++) {
            joinedName += nameParts[i];
            if (i < nameParts.length - 1) {
                joinedName += " ";
            }
        }
        return joinedName;
    }

    const urlParts = imageUrl.split("/");
    const lastIndex = urlParts.length - 1;
    const fileNameWithExtension = urlParts[lastIndex];
    const fileNameParts = fileNameWithExtension.split(".");
    const fileName = fileNameParts[0];

    let breedName = "";
    for (let i = 0; i < fileName.length; i++) {
        if (fileName[i] === "-") {
            breedName += " ";
        } else {
            breedName += fileName[i];
        }
    }
    return breedName;
}

async function showRandomDogFact() {
    const h3 = document.getElementById("h3");
    const indexH3 = Math.floor(Math.random() * arrayDogFrase.length);
    h3.textContent = arrayDogFrase[indexH3];

    const response = await fetch("http://localhost:8000/dogfact");
    const facts = await response.json();
    if (facts.length > 0) {
        const index = Math.floor(Math.random() * facts.length);
        let fact = facts[index];
        document.getElementById("dogFact").textContent = fact;
    }
}

async function getCommonBreeds() {
    const ceoResponse = await fetch("http://localhost:8000/dogbreedsecond");
    const ceoJson = await ceoResponse.json();
    const ceoBreeds = ceoJson.map(breed => breed.toLowerCase());

    const dogApiResponse = await fetch("http://localhost:8000/dogbreed");
    const dogApiJson = await dogApiResponse.json();
    const dogApiBreeds = dogApiJson.map(breed => breed.name.toLowerCase());

    let commonBreeds = ceoBreeds.filter(breed => dogApiBreeds.includes(breed));

    commonBreeds = commonBreeds.filter(breed =>
        breed !== "russell terrier" && breed !== "russell-terrier"
    );
    return commonBreeds;
}

let flippedCards = [];
let lockBoard = false;

function createCard(imageUrl) {
    const card = document.createElement("div");
    card.classList.add("memoryCard");

    const cardInner = document.createElement("div");
    cardInner.classList.add("memoryCardInner");

    const front = document.createElement("img");
    front.classList.add("cardFront");
    front.src = imageUrl;

    const back = document.createElement("div");
    back.classList.add("cardBack");

    cardInner.appendChild(front);
    cardInner.appendChild(back);
    card.appendChild(cardInner);

    card.setAttribute("data-image", imageUrl);

    card.addEventListener("click", function () {
        if (lockBoard) return;
        if (card.classList.contains("matched")) return;
        if (card.classList.contains("flipped")) return;

        card.classList.add("flipped");
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    });
    return card;
}

createCloseX(document.getElementById("popupFact"));

let matchPairCounter = 0;

async function checkForMatch() {
    matchCounter++;
    updateCounterDisplay();

    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    if (isMatch) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        flippedCards = [];

        const imageUrl = card1.dataset.image;
        const desc = getDescriptionFromImageUrl(imageUrl);
        const breed = getBreedFromImageUrl(imageUrl);

        const descContainer = document.getElementById("desc");
        const descDiv = document.createElement("div");
        descDiv.classList.add("descriptions");
        descContainer.prepend(descDiv);

        window.setDropdownOpen(true);

        const divBreed = document.createElement("div");
        descDiv.append(divBreed);
        divBreed.textContent = `${breed}:`;
        divBreed.classList.add("descBreed")

        const description = document.createElement("div");
        description.classList.add("descText");
        descDiv.append(description);
        description.textContent = desc;

        matchPairCounter++;

        const faveButton = document.createElement("button");
        faveButton.type = "button";
        faveButton.innerHTML = "♡";
        faveButton.classList.add("faveButton");
        faveButton.title = "Save dog to favorites";
        descDiv.appendChild(faveButton);

        const favorites = await getFavorites();
        const lowerCaseFavorites = favorites.map(f => f.toLowerCase());

        const breedLower = breed.toLowerCase();

        if (lowerCaseFavorites.includes(breedLower)) {
            faveButton.innerHTML = "♥";
            faveButton.classList.add("favorited");
        }

        faveButton.addEventListener("click", async function () {
            if (!currentUser) {
                showAlert("You need to be logged in to save favorites!");
                return;
            }

            let favorites = await getFavorites();

            let lowercaseFavorites = [];
            for (let i = 0; i < favorites.length; i++) {
                lowercaseFavorites.push(favorites[i].toLowerCase());
            }

            if (lowercaseFavorites.includes(breedLower)) {
                await removeFavorite(breedLower);
                faveButton.innerHTML = "♡";
                faveButton.classList.remove("favorited");
                faveButton.title = "Save dog to favorites";
            } else {
                await saveFavorite(breedLower);
                faveButton.innerHTML = "♥";
                faveButton.classList.add("favorited");
                faveButton.title = "Remove dog from favorites";
            }
        });

        if (matchPairCounter % 3 === 0) {
            setTimeout(async function () {
                await showRandomDogFact();
                const popup = document.getElementById("popupFact");
                popup.classList.remove("show");
                popup.classList.add("show");
            }, 300);
        }

        const totalCards = document.querySelectorAll(".memoryCard").length;
        const totalPairs = totalCards / 2;
        if (matchPairCounter === totalPairs) {
            await checkAndSendHighscore()
        }

    } else {
        lockBoard = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }

    const allCards = document.querySelectorAll(".memoryCard");
    const allCardsMatch = document.querySelectorAll(".memoryCard.matched");

    if (allCardsMatch.length === allCards.length) {
        setTimeout(() => {
            const restartButtonBottom = document.getElementById("restartButton");
            restartButtonBottom.style.display = "none";
            const winPopup = document.getElementById("popupWin");
            winPopup.classList.add("show");

            if (isLoggedin == false) {
                const wantToSaveHighscore = document.createElement("h4")
                wantToSaveHighscore.textContent = "Login or register to save your highscore!"
                wantToSaveHighscore.style.textAlign = "center"
                winPopup.append(wantToSaveHighscore)

                const button = document.createElement("button")
                button.classList.add("openAuthPopup")
                button.textContent = "Login/Register"
                button.id = "winLoginRegisterButton"
                winPopup.append(button)

                button.addEventListener("click", function () {
                    winPopup.classList.remove("show");
                    authPopup.classList.add("show");
                    authPopup.classList.remove("narrow");
                    document.getElementById("restartButton").style.display = "block";
                });
            }
        }, 800);
    }
}

const memoryContainer = document.getElementById("memory-Container");
async function preloadImages(imageUrls) {
    const promises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = reject;
        });
    });
    return Promise.all(promises);
}

async function restartGame() {
    matchCounter = 0;
    matchPairCounter = 0;
    flippedCards = [];
    lockBoard = false;
    updateCounterDisplay();

    const descContainer = document.getElementById("desc");
    const descriptions = descContainer.querySelectorAll('.descriptions');

    for (let i = 0; i < descriptions.length; i++) {
        descriptions[i].remove();
    }

    descContainer.style.display = "flex";
    window.setDropdownOpen(false);

    if (breedmanager) {
        await breedmanager.fetchBreed();
    }

    await getDogPic();
    const restartButtonBottom = document.getElementById("restartButton");
    restartButtonBottom.style.display = "block";
}

function flipTheCards() {
    const flipped = document.querySelectorAll('.memoryCard.flipped');
    for (let i = 0; i < flipped.length; i++) {
        flipped[i].classList.remove('flipped');
    }
}

restartButton.addEventListener('click', function () {
    flipTheCards();
    setTimeout(() => {
        loadingScreen.classList.add("show");
    }, 300);

    setTimeout(async () => {
        await restartGame();
    }, 700);
});

winRestartButton.addEventListener("click", function () {
    const flippedCards = document.querySelectorAll('.memoryCard.flipped');

    for (let i = 0; i < flippedCards.length; i++) {
        flippedCards[i].classList.remove('flipped');
    }

    setTimeout(() => {
        loadingScreen.classList.add("show");
    }, 300);

    setTimeout(async () => {
        await restartGame();
        const winPopup = document.getElementById("popupWin");
        winPopup.classList.remove("show");
    }, 700);
});


createCloseX(document.getElementById("popupWin"));

openAuthPopupButton.addEventListener("click", function () {
    authPopup.classList.add("show");
    authPopup.classList.add("narrow");
});

async function findLoggedUserHighscore() {
    const response = await fetch("http://localhost:8000/getAllAccounts");
    const data = await response.json();
    const userAccount = data.accounts.find(acc => acc.username === currentUser);
    const userHighscore = userAccount.highscore;
    return userHighscore;
}

async function checkAndSendHighscore() {
    if (isLoggedin && currentUser) {
        const currentHighscore = await findLoggedUserHighscore();
        const noHighscoreYet = currentHighscore === null || currentHighscore === undefined || currentHighscore === 0;

        if (matchCounter >= 10 && (noHighscoreYet || matchCounter < currentHighscore)) {
            const data = {
                highscore: matchCounter,
                currentUser: currentUser
            };

            const response = await fetch("http://localhost:8000/highscore", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            await showHighscoreBox();
        }
    }
}

async function showHighscoreBox() {
    const myAccount = document.getElementById("myAccount");
    myAccount.style.display = "block";

    const response = await fetch("http://localhost:8000/getAllAccounts")

    if (response.ok) {
        const data = await response.json()
        const userAccount = data.accounts.find(acc => acc.username === currentUser);
        let highscore = matchCounter;
        if (userAccount) {
            highscore = userAccount.highscore;
            if (highscore === 0 || highscore === null || highscore === undefined) {
                highScoreBox.innerHTML = `<h2>No Highscore <span style="color:#E875D7;">Yet!</span></h2>`;
            } else {
                highScoreBox.innerHTML = `<h2>Highscore: ${highscore}</h2>`
            }
        }
    }
}

function createFavoriteLi(breed) {
    const li = document.createElement("li");

    li.style.display = "flex";
    li.style.alignItems = "center";
    li.dataset.breed = breed;

    const heartBtn = document.createElement("button");
    heartBtn.innerHTML = "♥";
    heartBtn.className = "faveButton favorited listHeart";
    heartBtn.title = "Remove dog from favorite";

    heartBtn.addEventListener("click", async function () {
        await removeFavorite(breed);
    });

    const span = document.createElement("span");

    const words = breed.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].slice(1);
    }
    span.textContent = words.join(" ");

    span.style.fontSize = "20px";

    li.appendChild(heartBtn);
    li.appendChild(span);

    return li;
}

async function saveFavorite(breedName) {
    if (!currentUser) {
        showAlert("Logged out!");
        return;
    }

    await fetch("http://localhost:8000/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, breed: breedName })
    });

    const ul = document.getElementById("favoritesList");
    const existingBreed = document.querySelector(`[data-breed="${breedName}"]`);

    if (!existingBreed) {
        const noSavedDogs = document.getElementById("noSavedDogs");
        if (noSavedDogs) noSavedDogs.remove();

        const newLi = createFavoriteLi(breedName);
        ul.appendChild(newLi);
    }
}

async function getFavorites() {
    if (!currentUser) {
        return [];
    }
    const response = await fetch(`http://localhost:8000/favorite?username=${currentUser}`);

    if (response.ok) {
        const data = await response.json();
        let favorites = [];
        if (data.favorites) {
            favorites = data.favorites;
        }
        return favorites;
    } else {
        return [];
    }
}

async function removeFavorite(breedName) {
    if (!currentUser) return;

    await fetch("http://localhost:8000/favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, breed: breedName })
    });

    const ulList = document.getElementById("favoritesList");

    const liToRemove = document.querySelector(`[data-breed="${breedName}"]`);
    if (liToRemove) liToRemove.remove();

    const remainingItems = ulList.querySelectorAll("li");
    if (remainingItems.length === 0) {
        const noSavedDogs = document.createElement("p");
        noSavedDogs.id = "noSavedDogs";
        noSavedDogs.innerHTML = "Your saved dogs <br> will appear here!";
        ulList.appendChild(noSavedDogs);
    }
    updateAllFaveBoxes();
}

async function updateAllFaveBoxes() {
    const favorites = await getFavorites();
    let lowerFavorites = [];

    for (let i = 0; i < favorites.length; i++) {
        lowerFavorites.push(favorites[i].toLowerCase());
    }

    let faveButtons = document.querySelectorAll(".faveButton:not(.listHeart)");

    for (let i = 0; i < faveButtons.length; i++) {
        const btn = faveButtons[i];
        const breedDiv = btn.parentElement.querySelector(".descBreed");

        if (!breedDiv) continue;

        let breed = breedDiv.textContent.replace(":", "").trim().toLowerCase();

        if (lowerFavorites.includes(breed)) {
            btn.innerHTML = "♥";
            btn.classList.add("favorited");
        } else {
            btn.innerHTML = "♡";
            btn.classList.remove("favorited");
        }
    }
}

async function showFavoritesBox() {
    document.getElementById("myAccount").style.display = "block";
    let faveBox = document.getElementById("favoritesBox");

    if (!faveBox) {
        faveBox = document.createElement("div");
        faveBox.id = "favoritesBox";
        faveBox.innerHTML = "<h2>Saved Breeds:</h2>";

        const ul = document.createElement("ul");
        ul.id = "favoritesList";
        ul.style.listStyle = "none";
        ul.style.padding = "0";
        ul.style.margin = "30px 0";
        faveBox.appendChild(ul);

        document.getElementById("myAccount").appendChild(faveBox);
    }

    const ul = document.getElementById("favoritesList");
    ul.innerHTML = "";

    if (!currentUser) return;

    const favorites = await getFavorites();
    if (!favorites || favorites.length === 0) {
        ul.innerHTML = '<p id="noSavedDogs">Your saved dogs <br> will appear here!</p>';
        return;
    }
    for (let i = 0; i < favorites.length; i++) {
        ul.appendChild(createFavoriteLi(favorites[i]));
    }
}

const ContainerMemory = document.getElementById("memory-Container");
ContainerMemory.style.position = "relative";

const overlay = document.createElement("div");
overlay.id = "startOverlay";

const startGameButton = document.createElement("button");
startGameButton.classList.add("blueButton");
startGameButton.textContent = "Start Game";

overlay.appendChild(startGameButton);
ContainerMemory.appendChild(overlay);

startGameButton.addEventListener("click", async function () {
    overlay.style.display = "none";
});

if (firstLoad) {
    overlay.style.display = "flex";
}

function dropdown() {
    const dropdown = document.getElementById("drop-down");
    const scrollIndicator = document.getElementById("scroll-indicator");
    const desc = document.getElementById("desc");

    let open = false;

    scrollIndicator.style.display = "none";
    desc.style.background = "none";
    dropdown.classList.remove("active");
    dropdown.style.borderRadius = "10px";

    const descriptions = desc.querySelectorAll('.descriptions');
    for (let i = 0; i < descriptions.length; i++) {
        descriptions[i].style.display = "none";
    }

    function setDropdownOpen(state) {
        open = state;
        if (open) {
            scrollIndicator.style.display = "block";
        } else {
            scrollIndicator.style.display = "none";
        }

        const descriptions = desc.querySelectorAll('.descriptions');
        for (let i = 0; i < descriptions.length; i++) {
            if (open) {
                descriptions[i].style.display = "";
            } else {
                descriptions[i].style.display = "none";
            }
        }

        if (open) {
            dropdown.classList.add("active");
            dropdown.style.borderRadius = "10px 10px 0px 0px";
            desc.style.background = "";
        } else {
            dropdown.classList.remove("active");
            dropdown.style.borderRadius = "10px";
            desc.style.background = "none";
        }
    }

    dropdown.addEventListener("click", function () {
        setDropdownOpen(!open);
    });

    window.setDropdownOpen = setDropdownOpen;
}


const authPopup = document.getElementById("authPopup");
const openAuthPopup = document.querySelector(".openAuthPopup");
const highScoreBox = document.getElementById("savedHighscore");

openAuthPopup.addEventListener("click", function () {
    if (!isLoggedin) {
        authPopup.classList.add("show");

    } else {
        isLoggedin = false;
        currentUser = null;
        showAlert("Logged out!");

        restartGame();
        flipTheCards();

        authPopup.classList.remove("show");
        highScoreBox.innerHTML = "";
        openAuthPopup.innerHTML = "Login/Register";
        openAuthPopup.removeAttribute("style");
        document.getElementById("myAccount").style.display = "none";
    }
});

createCloseX(document.getElementById("authPopup"));

createButton.addEventListener("click", async function () {
    const username = document.getElementById("createUsername").value;
    const password = document.getElementById("createPassword").value;

    if (!username || !password) {
        showAlert("Please enter both a username and a password.");
        return;
    }

    const response = await fetch("http://localhost:8000/savedAccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (response.status == 409) {
        showAlert("The username is already taken");
        isLoggedin = false;
    }

    if (response.ok) {
        currentUser = username;
        isLoggedin = true;

        showAlert("Account created!");
        authPopup.classList.remove("show");

        document.getElementById("createUsername").value = "";
        document.getElementById("createPassword").value = "";

        buttonDesign();
        await showHighscoreBox();
        await checkAndSendHighscore();
        await showFavoritesBox();
    }
});

loginButton.addEventListener("click", async function () {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    function isGameWon() {
        const allCards = document.querySelectorAll(".memoryCard");
        const allCardsMatch = document.querySelectorAll(".memoryCard.matched");

        return allCards.length > 0 && allCardsMatch.length === allCards.length;
    }

    const result = await response.json();
    if (result.success) {
        isLoggedin = true
        buttonDesign();
        currentUser = username;

        await checkAndSendHighscore();
        await showHighscoreBox();
        await showFavoritesBox();

        if (isGameWon()) {
            await checkAndSendHighscore();
        }
    } else {
        showAlert("Wrong username or password.");
    }
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";
});

function buttonDesign() {
    authPopup.classList.remove("show");
    openAuthPopup.style.backgroundColor = "#E2EFFF"
    openAuthPopup.style.color = "#0F3665"
    openAuthPopup.style.fontFamily = "Jua, sans-serif"
    openAuthPopup.style.fontSize = "24px"
    openAuthPopup.textContent = "Log out"
}


async function initGame() {
    breedmanager = new DogbreedManager();
    await breedmanager.fetchBreed();
    await getDogPic();
    dropdown();
}

initGame();