const useDevMode = true;

let matchCounter = 0;
const count = document.getElementById("count");
count.textContent = matchCounter;
let currentUser = null;
let isLoggedin = false;





const restartButton = document.getElementById('restartButton');
let firstLoad = true;
let allBreedsWithDesc = [];
let breedmanager;
const winRestartButton = document.getElementById("winRestartButton");
const loadingScreen = document.getElementById("loading-screen");
const createButton = document.getElementById("createButton");
const loginButton = document.getElementById("loginButton");
const openAuthPopupButton = document.querySelector(".openAuthPopup");

function updateCounterDisplay() {
    count.textContent = matchCounter;
}

async function fetchAllBreedsWithDesc() {
    const response = await fetch("http://localhost:8000/dogbreed");
    allBreedsWithDesc = await response.json();
}

function createFavoriteLi(breed) {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.dataset.breed = breed;

    let heartBtn = document.createElement("button");
    heartBtn.innerHTML = "♥";
    heartBtn.className = "faveButton favorited listHeart";
    heartBtn.addEventListener("click", async function () {
        await removeFavorite(breed);
    });

    let span = document.createElement("span");
    span.textContent = breed
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    li.appendChild(heartBtn);
    li.appendChild(span);
    return li;
}

async function saveFavorite(breedName) {
    if (!currentUser) {
        alert("You need to be logged in to save favorites!");
        return;
    }
    await fetch("http://localhost:8000/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, breed: breedName })
    });

    const ul = document.getElementById("favoritesList");
    if (ul && ![...ul.children].some(function (li) {
        return li.dataset.breed === breedName;
    })) {
        if (ul.children.length === 1 && ul.children[0].tagName === "P") ul.innerHTML = "";
        ul.appendChild(createFavoriteLi(breedName));
    }
}

async function getFavorites() {
    if (!currentUser) {
        console.log("ingen inloggad användare")
        return [];
    }
    const response = await fetch(`http://localhost:8000/favorite?username=${currentUser}`)
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
    const ul = document.getElementById("favoritesList");
    if (ul) {
        const li = [...ul.children].find(li => li.dataset.breed === breedName);
        if (li) li.remove();
        if (ul.children.length === 0) {
            ul.innerHTML = "<p>Your saved dogs will appear here!</p>";
        }
    }
    updateAllFaveBoxes();
}

async function updateAllFaveBoxes() {
    const favorites = await getFavorites();
    const lowerFavorites = favorites.map(function (f) { return f.toLowerCase(); });
    let faveButtons = document.querySelectorAll(".faveButton:not(.listHeart");
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
        faveBox.innerHTML = "<h2>Saved Breeds</h2>";
        const ul = document.createElement("ul");
        ul.id = "favoritesList";
        ul.style.listStyle = "none";
        ul.style.padding = "0";
        faveBox.appendChild(ul);
        document.getElementById("myAccount").appendChild(faveBox);
    }

    const ul = document.getElementById("favoritesList");
    ul.innerHTML = "";
    if (!currentUser) return;
    const favorites = await getFavorites();
    if (!favorites || favorites.length === 0) {
        ul.innerHTML = "<p>Your saved dogs will appear here!</p>";
        return;
    }
    for (let i = 0; i < favorites.length; i++) {
        ul.appendChild(createFavoriteLi(favorites[i]));
    }
}


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
        let url;
        url = "http://localhost:8000/dogbreed"; // Live API

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

const devImages = [
    "affenpinscher.jpg",
    "afghan-hound.jpg",
    "akita.jpg",
    "australian-terrier.jpg",
    "basenji.jpg",
    "basset-hound.jpg",
    "beagle.jpg",
    "bedlington-terrier.jpg",
    "bichon-frise.jpg",
    "border-collie.jpg",
    "border-terrier.jpg",
    "borzoi.jpg",
    "boxer.jpg",
    "briard.jpg",
    "cairn-terrier.jpg",
    "chihuahua.jpg",
    "cocker-spaniel.jpg",
    "dachshund.jpg",
    "dalmatian.jpg",
    "english-setter.jpg",
    "french-bulldog.jpg",
    "giant-schnauzer.jpg",
    "golden-retriever.jpg",
    "gordon-setter.jpg",
    "great-dane.jpg",
    "havanese.jpg",
    "ibizan-hound.jpg",
    "irish-setter.jpg",
    "irish-terrier.jpg",
    "irish-wolfhound.jpg",
    "italian-greyhound.jpg",
    "japanese-spitz.jpg",
    "keeshond.jpg",
    "komondor.jpg",
    "kuvasz.jpg",
    "lakeland-terrier.jpg",
    "maltese.jpg",
    "miniature-pinscher.jpg",
    "miniature-schnauzer.jpg",
    "newfoundland.jpg",
    "norfolk-terrier.jpg",
    "norwegian-buhund.jpg",
    "norwegian-elkhound.jpg",
    "norwich-terrier.jpg",
    "otterhound.jpg",
    "papillon.jpg",
    "pomeranian.jpg",
    "pug.jpg",
    "rhodesian-ridgeback.jpg",
    "rottweiler.jpg",
    "saluki.jpg",
    "samoyed.jpg",
    "schipperke.jpg",
    "scottish-deerhound.jpg",
    "scottish-terrier.jpg",
    "sealyham-terrier.jpg",
    "shetland-sheepdog.jpg",
    "silky-terrier.jpg",
    "sussex-spaniel.jpg",
    "tibetan-mastiff.jpg",
    "tibetan-terrier.jpg",
    "vizsla.jpg",
    "weimaraner.jpg",
    "welsh-terrier.jpg",
    "whippet.jpg",
    "yorkshire-terrier.jpg"
    // För när vi inte vill hämta från sidan!
];


const arrayDogFrase = ["Paws-itively brilliant!", "You sniffed out that match like a pro!", "You’ve got a nose for matches!", "Howl you do that? Amazing!", "You're fetching those pairs like a good pup!", "Tail wags for that one – well done!"]

function getDescriptionFromImageUrl(imageUrl) {
    // Extrahera rasnamn
    const match = imageUrl.match(/\/breeds\/([^/]+)\//);
    let breedName;
    if (match && match[1]) {
        const parts = match[1].split("-");
        if (parts.length === 2) {
            breedName = parts[1] + " " + parts[0];
        } else {
            breedName = parts.join(" ");
        }
    } else {
        breedName = imageUrl.split("/").pop().split(".")[0].replace(/-/g, " ");
    }

    if (breedmanager && breedmanager.instances) {
        for (let i = 0; i < breedmanager.instances.length; i++) {
            if (breedmanager.instances[i].name.toLowerCase() === breedName.toLowerCase()) {
                return breedmanager.instances[i].description;
            }
        }
    }
    return "Ingen beskrivning hittades.";
}

function getBreedFromImageUrl(imageUrl) {
    const match = imageUrl.match(/\/breeds\/([^/]+)\//);
    let breed;
    if (match && match[1]) {
        breed = match[1].replace(/-/g, " ");
    } else {
        breed = imageUrl.split("/").pop().split(".")[0].replace(/-/g, " ");
    }

    return breed.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

async function showRandomDogFact() {

    const h3 = document.getElementById("wof");
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

//skapa framsida och baksida på kort samt att vända på korten
let flippedCards = [];
let lockBoard = false; //låser korten så att man inte kan klicka på mer än 2 åt gången

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

    card.setAttribute("data-image", imageUrl); //lägger till ett html-attribut "data-image" till card

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
        descContainer.prepend(descDiv);
        descDiv.classList.add("descriptions");

        const divBreed = document.createElement("div");
        descDiv.append(divBreed);
        divBreed.textContent = `${breed}:`;
        divBreed.classList.add("descBreed")

        const description = document.createElement("div");
        descDiv.append(description);
        description.textContent = desc;

        matchPairCounter++;

        const faveButton = document.createElement("button");
        faveButton.type = "button";
        faveButton.innerHTML = "♡";
        faveButton.classList.add("faveButton");
        descDiv.appendChild(faveButton);

        getFavorites().then(function (favorites) {
            if (favorites.map(function (f) { return f.toLowerCase(); }).includes(breedLower)) {
                faveButton.innerHTML = "♥";
                faveButton.classList.add("favorited");
            }
        })
        const breedLower = breed.toLowerCase();
        faveButton.addEventListener("click", async function () {
            if (!currentUser) {
                alert("You need to be logged in to save favorites!");
                return;
            }
            let favorites = (await getFavorites()).map(function (f) { return f.toLowerCase(); });
            if (favorites.includes(breedLower)) {
                await removeFavorite(breedLower);
                faveButton.innerHTML = "♡";
                faveButton.classList.remove("favorited");
            } else {
                await saveFavorite(breedLower);
                faveButton.innerHTML = "♥";
                faveButton.classList.add("favorited");
            }
        });

        if (matchPairCounter % 3 === 0) {
            // Visa popup bara var 3:e gång
            setTimeout(async function () {
                await showRandomDogFact();
                const popup = document.getElementById("popupFact");
                popup.classList.remove("show");
                // void popup.offsetWidth;
                popup.classList.add("show");
            }, 400);
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


    //vinst av spelet
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
                button.id = "secondButton"
                winPopup.append(button)

                button.addEventListener("click", () => {
                    winPopup.classList.remove("show");
                    authPopup.classList.add("show");
                    authPopup.classList.remove("narrow");
                });
            }

        }, 800); // lite delay så man hinner se sista kortet vändas
    }
}

//få bilder och blanda dem
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

    if (useDevMode) {
        const imagesCopy = [...devImages];
        for (let i = 0; i < 10 && imagesCopy.length > 0; i++) {
            const idx = Math.floor(Math.random() * imagesCopy.length);
            selectedImages.push(imagesCopy.splice(idx, 1)[0]);
        }

        for (let img of selectedImages) {
            allDogPics.push(`images/${img}`);
            allDogPics.push(`images/${img}`);
        }
    } else {
        const breeds = await getCommonBreeds();
        const selectedBreeds = [];
        const breedsCopy = [...breeds];

        for (let i = 0; i < 10 && breedsCopy.length > 0; i++) {
            const idx = Math.floor(Math.random() * breedsCopy.length);
            selectedBreeds.push(breedsCopy.splice(idx, 1)[0]);
        }

        function toDogCeoApiBreed(breed) {
            const parts = breed.toLowerCase().split(" ");
            if (parts.length === 2) {
                return `${parts[1]}/${parts[0]}`;
            }
            return parts.join("-");
        }

        for (const breed of selectedBreeds) {
            const apiBreed = toDogCeoApiBreed(breed);
            const response = await fetch(`http://localhost:8000/dogpic?breed=${apiBreed}`);
            const data = await response.json();
            allDogPics.push(data.message);
            allDogPics.push(data.message);
        }
    }

    // Blanda bilderna
    const shuffledPics = [];
    while (allDogPics.length > 0) {
        const index = Math.floor(Math.random() * allDogPics.length);
        shuffledPics.push(allDogPics.splice(index, 1)[0]);
    }

    // Vänta tills alla bilder är laddade
    await preloadImages(shuffledPics);

    // Rensa gamla kort
    const cards = memoryContainer.querySelectorAll('.memoryCard');
    cards.forEach(card => memoryContainer.removeChild(card));

    // Skapa nya kort
    for (let i = 0; i < shuffledPics.length; i++) {
        const card = createCard(shuffledPics[i]);
        memoryContainer.appendChild(card);
    }

    loadingScreen.classList.remove("show"); // Dölj loading
    return selectedImages;
}

//Tar gemensamma hundar från api1 och api2 och skapar en ny array
async function getCommonBreeds() {
    // Hämta redan platt array från din backend
    const ceoResponse = await fetch("http://localhost:8000/dogbreedsecond");
    const ceoBreeds = (await ceoResponse.json()).map(b => b.toLowerCase());

    const dogApiResponse = await fetch("http://localhost:8000/dogbreed");
    const dogApiBreeds = (await dogApiResponse.json()).map(b => b.name.toLowerCase());

    let commonBreeds = ceoBreeds.filter(breed => dogApiBreeds.includes(breed));
    commonBreeds = commonBreeds.filter(breed => breed !== "russell terrier" && breed !== "russell-terrier");
    return commonBreeds;
}

function restartGame() {
    matchCounter = 0;
    matchPairCounter = 0;
    flippedCards = [];
    lockBoard = false;
    updateCounterDisplay();
    const descContainer = document.getElementById("desc");
    descContainer.innerHTML = ""; // Rensa beskrivningar
    // Vänta lite så att korten hinner vändas tillbaka
    setTimeout(() => {
        getDogPic();
    }, 600); // Justera tiden om du vill

    const restartButtonBottom = document.getElementById("restartButton");
    restartButtonBottom.style.display = "block";
}

function flipTheCards() {
    const flipped = document.querySelectorAll('.memoryCard.flipped');
    flipped.forEach(card => {
        card.classList.remove('flipped');
    });
}

restartButton.addEventListener('click', function () {
    flipTheCards()
    // Vänta lite innan spelet laddas om
    setTimeout(async () => {
        restartGame(); // eller getDogPic(), beroende på vad du använder
        loadingScreen.classList.remove("show");
    }, 100); // Delay för fade-effekt
});

winRestartButton.addEventListener("click", function () {
    const flippedCards = document.querySelectorAll('.memoryCard.flipped');
    flippedCards.forEach(card => {
        card.classList.remove('flipped');
    });
    restartGame();
    const winPopup = document.getElementById("popupWin");
    winPopup.classList.remove("show");
});

createCloseX(document.getElementById("popupWin"));


openAuthPopupButton.addEventListener("click", function () {
    authPopup.classList.add("show");
    authPopup.classList.add("narrow");
})

//Login
const authPopup = document.getElementById("authPopup");
const openAuthPopup = document.querySelector(".openAuthPopup");
const highScoreBox = document.getElementById("savedHighscore");

openAuthPopup.addEventListener("click", () => {
    if (!isLoggedin) {
        authPopup.classList.add("show");

    } else {
        isLoggedin = false;
        currentUser = null;
        localStorage.removeItem("loggedInUser");
        alert("Du är nu utloggad!");
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
        alert("Please enter both a username and a password.");
        return;
    }

    const response = await fetch("http://localhost:8000/savedAccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (response.status == 409) {
        alert("The username is already taken");
        isLoggedin = false;
    }

    if (response.ok) {
        currentUser = username;
        isLoggedin = true
        currentUser = username;
        alert("Account created!");
        authPopup.classList.remove("show");
        localStorage.setItem("loggedInUser", username);

        document.getElementById("createUsername").value = "";
        document.getElementById("createPassword").value = "";
        buttonDesign();
        await showHighscoreBox();
        await checkAndSendHighscore()
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
        alert("Login successful!");

        await checkAndSendHighscore()
        await showHighscoreBox()
        await showFavoritesBox();

        if (isGameWon()) {
            await checkAndSendHighscore();
        }


    } else {
        alert("Wrong username or password.");
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


//spara highscore

async function findLoggedUserHighscore() {
    const response = await fetch("http://localhost:8000/getAllAccounts")
    const data = await response.json()
    const userAccount = data.accounts.find(acc => acc.username === currentUser);
    const userHighscore = userAccount.highscore
    return userHighscore
}
async function checkAndSendHighscore() {
    if (isLoggedin && currentUser) {
        const currentHighscore = await findLoggedUserHighscore();
        const noHighscoreYet = currentHighscore === null || currentHighscore === undefined || currentHighscore === 0;

        if (matchCounter >= 10 && (noHighscoreYet || matchCounter < currentHighscore)) {
            const data = { highscore: matchCounter, currentUser: currentUser };
            const response = await fetch("http://localhost:8000/highscore", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            await showHighscoreBox()
        }
    }
}

(async function () {
    breedmanager = new DogbreedManager();
    await breedmanager.fetchBreed();
    await getDogPic();
})();

async function showHighscoreBox() {
    const myAccount = document.getElementById("myAccount");
    myAccount.style.display = "block";

    const response = await fetch("http://localhost:8000/getAllAccounts")


    if (response.ok) {
        const data = await response.json()
        const userAccount = data.accounts.find(acc => acc.username === currentUser);
        let highscore = matchCounter;
        if (userAccount) {
            highscore = userAccount.highscore ?? 0;  // Sätt highscore till userAccount.highscore eller 0 om undefined/null
            highScoreBox.innerHTML = `<h2>Highscore:${highscore}</h2>`
        }
    }
}


// === START GAME BUTTON + OVERLAY ===
const ContainerMemory = document.getElementById("memory-Container");
ContainerMemory.style.position = "relative"; // Gör container till position-parent

const overlay = document.createElement("div");
overlay.id = "startOverlay";

const startGameButton = document.createElement("button");
startGameButton.id = "tries";
startGameButton.textContent = "Start Game";

overlay.appendChild(startGameButton);
ContainerMemory.appendChild(overlay); // Lägg in overlay direkt i memory-container

startGameButton.addEventListener("click", async function () {
    overlay.style.display = "none";
    await getDogPic();
});

if (firstLoad) {
    overlay.style.display = "flex";
}


//ANVÄND DENNA FUNKTION OM DU VILL ATT SPELET SKA VINNA DRIEKT
//ANROPA winGameInstantly() I KONSOLLEN
function winGameInstantly() {
    const allCards = document.querySelectorAll(".memoryCard");

    allCards.forEach(card => {
        card.classList.add("matched");
    });

    matchPairCounter = allCards.length / 2;
    matchCounter = 10; // Bästa möjliga score

    updateCounterDisplay();

    setTimeout(() => {
        const restartButtonBottom = document.getElementById("restartButton");
        restartButtonBottom.style.display = "none";

        const winPopup = document.getElementById("popupWin");
        winPopup.classList.add("show");

        if (!isLoggedin) {
            const wantToSaveHighscore = document.createElement("h4");
            wantToSaveHighscore.textContent = "Login or register to save your highscore!";
            wantToSaveHighscore.style.textAlign = "center";
            winPopup.append(wantToSaveHighscore);

            const button = document.createElement("button");
            button.classList.add("openAuthPopup");
            button.textContent = "Login/Register";
            button.id = "secondButton";
            winPopup.append(button);

            button.addEventListener("click", () => {
                winPopup.classList.remove("show");
                authPopup.classList.add("show");
                authPopup.classList.remove("narrow");
            });
        }

        checkAndSendHighscore(); // Spara automatiskt 10 som highscore om inloggad
    }, 500);
}
