const useDevMode = true;

let matchCounter = 0;
const count = document.getElementById("count");
count.textContent = matchCounter;



const restartButton = document.getElementById('restartButton');
let firstLoad = true;
let allBreedsWithDesc = [];
let breedmanager;
const winRestartButton = document.getElementById("winRestartButton");
const loadingScreen = document.getElementById("loading-screen");

function updateCounterDisplay() {
    count.textContent = matchCounter;
}

async function fetchAllBreedsWithDesc() {
    const response = await fetch("http://localhost:8000/dogbreed");
    allBreedsWithDesc = await response.json();
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

// Hämta från HTML
const popup = document.querySelector("#popupFact");

// Skapa stäng-knappen
const closeX = document.createElement("div");
closeX.textContent = "X";
closeX.style.position = "absolute";
closeX.style.top = "10px";
closeX.style.right = "32px";
closeX.style.cursor = "pointer";
closeX.style.fontSize = "20px";
closeX.style.fontWeight = "bold";
closeX.style.color = "white";

popup.appendChild(closeX);

closeX.addEventListener("click", function () {
    popup.classList.remove("show");
});

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

        const descContainer = document.getElementById("desc")
        const descDiv = document.createElement("div")
        descContainer.append(descDiv)
        descDiv.classList.add("descriptions")
        descDiv.textContent = desc
        console.log("Beskrivning:", desc);

        matchPairCounter++;

        if (matchPairCounter % 3 === 0) {
            // Visa popup bara var 3:e gång
            setTimeout(async function () {
                await showRandomDogFact();
                const popup = document.getElementById("popupFact");
                popup.classList.remove("show");
                // void popup.offsetWidth;
                popup.classList.add("show");
            }, 1000);
        }

        const totalCards = document.querySelectorAll(".memoryCard").length;
        const totalPairs = totalCards / 2;
        if (matchPairCounter === totalPairs) {
            checkAndSendHighscore()
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
            const winPopup = document.getElementById("popupWin");
            winPopup.classList.add("show");
        }, 800); // lite delay så man hinner se sista kortet vändas
    }
}
    //spara highscore
    async function checkAndSendHighscore() {
    // const totalCards = document.querySelectorAll(".memoryCard").length;
    // const totalPairs = totalCards / 2;

        const data = { username: "sara", password: "blabla", Highscore: matchPairCounter };

        const Acountrequest = new Request("http://localhost:8000/savedAcounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const response = await fetch(Acountrequest);
        const result = await response.json();
        console.log("Svar från servern:", result);
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

    // Vänta lite så att korten hinner vändas tillbaka
    setTimeout(() => {
        getDogPic();
    }, 600); // Justera tiden om du vill
}

restartButton.addEventListener('click', () => {
    const flipped = document.querySelectorAll('.memoryCard.flipped');
    flipped.forEach(card => {
        card.classList.remove('flipped');
    });

    // Vänta lite innan spelet laddas om
    setTimeout(async () => {
        await restartGame(); // eller getDogPic(), beroende på vad du använder
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



//Login
const authPopup = document.getElementById("authPopup");
const openAuthPopup = document.getElementById("openAuthPopup");
const createButton = document.getElementById("createButton");
const loginButton = document.getElementById("loginButton");

let isLoggedin = false;
openAuthPopup.addEventListener("click", () => {
    if (!isLoggedin) {
        authPopup.classList.add("show");
        isLoggedin = true
        
    } else {
        isLoggedin = false;
        alert("Du är nu utloggad!");

        authPopup.classList.remove("show"); 
        openAuthPopup.innerHTML = "Login/Register";
        openAuthPopup.removeAttribute("style");
    }
});

const popupContent = authPopup.querySelector(".popup-content-login");
popupContent.appendChild(closeX);

closeX.addEventListener("click", function () {
    authPopup.classList.remove("show");
});

createButton.addEventListener("click", async () => {
    const username = document.getElementById("createUsername").value;
    const password = document.getElementById("createPassword").value;

    const response = await fetch("http://localhost:8000/savedAcounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    alert("Account created!");
    authPopup.classList.remove("show");
    localStorage.setItem("loggedInUser", username);
});

loginButton.addEventListener("click", async () => {
    
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        isLoggedin = true
        alert("Login successful!");
        authPopup.classList.remove("show");

        openAuthPopup.style.backgroundColor = "#E2EFFF"
        openAuthPopup.style.color = "#0F3665"
        openAuthPopup.style.fontFamily = "Jua, sans-serif"
        openAuthPopup.style.fontSize = "24px"
        openAuthPopup.innerHTML = "Log out"
        openAuthPopup.classList.add("loggedIN")

        localStorage.setItem("loggedInUser", username);
    } else {
        alert("Wrong username or password.");
    }
});



(async function () {
    breedmanager = new DogbreedManager();
    await breedmanager.fetchBreed();
    await getDogPic();
})();
