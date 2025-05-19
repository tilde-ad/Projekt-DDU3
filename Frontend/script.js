//ta bort denna innan inlämning

let matchCounter = 0;

const useDevMode = true;

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
        if (useDevMode) {
            url = "http://localhost:8000/dogbreedseconddesc"; // Cachad version
        } else {
            url = "http://localhost:8000/dogbreed"; // Live API
        }

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

//Kallar på klasserna
async function driver() {
    const breedmanager = new DogbreedManager()
    await breedmanager.fetchBreed();
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
    "russel-terrier.jpg",
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

// Hämta popupen från HTML
const popup = document.getElementById("popup");

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
})

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.image === card2.dataset.image;

    if (isMatch) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        flippedCards = [];

        matchCounter++; // öka med 1 varje gång ett par hittas

        if (matchCounter % 3 === 0) {
            // Visa popup bara var 3:e gång
            setTimeout(function () {
                const popup = document.getElementById("popup");
                popup.classList.remove("show");
                void popup.offsetWidth;
                popup.classList.add("show");
            }, 1000);
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
}



//få bilder och blanda dem
const memoryContainer = document.getElementById("memory-Container");
async function getDogPic() {
    let selectedImages = [];
    if (useDevMode) {
        // Välj 10 unika slumpmässiga bilder från devImages
        const imagesCopy = [...devImages];
        for (let i = 0; i < 10 && imagesCopy.length > 0; i++) {
            const idx = Math.floor(Math.random() * imagesCopy.length);
            selectedImages.push(imagesCopy.splice(idx, 1)[0]);
        }
        // Skapa 2 av varje (20 bilder)
        const allDogPics = [];
        for (let img of selectedImages) {
            allDogPics.push(`images/${img}`);
            allDogPics.push(`images/${img}`);
        }
        // Blanda
        const shuffledPics = [];
        while (allDogPics.length > 0) {
            const index = Math.floor(Math.random() * allDogPics.length);
            shuffledPics.push(allDogPics.splice(index, 1)[0]);
        }
        // Visa bilderna
        const cards = memoryContainer.querySelectorAll('.memoryCard');
        for (let i = 0; i < cards.length; i++) {
            memoryContainer.removeChild(cards[i]);
        }
        for (let i = 0; i < shuffledPics.length; i++) {
            const card = createCard(shuffledPics[i]);
            memoryContainer.appendChild(card);
        }
        return selectedImages;
    } else { //Detta är vad som ska användas i orginalet!
        const breeds = await getCommonBreeds();
        // Välj 10 unika slumpmässiga raser
        const selectedBreeds = [];
        const breedsCopy = [...breeds];
        for (let i = 0; i < 10 && breedsCopy.length > 0; i++) {
            const idx = Math.floor(Math.random() * breedsCopy.length);
            selectedBreeds.push(breedsCopy.splice(idx, 1)[0]);
        }

        /* Test så rätt descriptions kommer med bara, kommenterar ut men behåller
        const breedmanager = new DogbreedManager();
        await breedmanager.fetchBreed();
        selectedBreeds.forEach(breed => {
            const match = breedmanager.instances.find(
                b => b.name.toLowerCase() === breed.toLowerCase()
            );
            if (match) {
                console.log(`Ras: ${match.name}, Beskrivning: ${match.description}`);
            } else {
                console.log(`Ras: ${breed}, Beskrivning: Hittades ej`);
            }
        });
        */

        function toDogCeoApiBreed(breed) {
            const parts = breed.toLowerCase().split(" ");
            if (parts.length === 2) {
                return `${parts[1]}/${parts[0]}`;
            }
            return parts.join("-");
        }

        // Hämta en bild per ras
        const dogPics = [];
        for (const breed of selectedBreeds) {
            const apiBreed = toDogCeoApiBreed(breed);
            const breedParam = `?breed=${apiBreed}`;
            const response = await fetch(`http://localhost:8000/dogpic${breedParam}`);
            const data = await response.json();
            dogPics.push(data.message);
        }

        // Steg 2: Skapa en lista med 2 av varje bild (8 par → 16 bilder)
        const allDogPics = [];
        for (let i = 0; i < dogPics.length; i++) {
            allDogPics.push(dogPics[i]);
            allDogPics.push(dogPics[i]);
        }

        // Steg 3: Blanda bilderna med manuell metod
        const shuffledPics = [];
        while (allDogPics.length > 0) {
            const index = Math.floor(Math.random() * allDogPics.length);
            const picked = allDogPics.splice(index, 1)[0]; // plocka och ta bort
            shuffledPics.push(picked);
        }

        // Steg 4: Lägg in bilderna i #pic1 till #pic16
        for (let i = 0; i < shuffledPics.length; i++) {
            const img = document.createElement("img");
            img.src = shuffledPics[i];


            const div = document.createElement("pic" + (i + 1))
            div.classList.add("memoryCard")
            memoryContainer.append(div)

            if (div) {
                div.appendChild(img);
            }
        }
        return dogPics
    }
}

//Tar gemensamma hundar från api1 och api2 och skapar en ny array
async function getCommonBreeds() {
    // Hämta redan platt array från din backend
    const ceoResponse = await fetch("http://localhost:8000/dogbreedsecond");
    const ceoBreeds = (await ceoResponse.json()).map(b => b.toLowerCase());

    const dogApiResponse = await fetch("http://localhost:8000/dogbreed");
    const dogApiBreeds = (await dogApiResponse.json()).map(b => b.name.toLowerCase());

    const commonBreeds = ceoBreeds.filter(breed => dogApiBreeds.includes(breed));
    return commonBreeds;
}

if (useDevMode) {
    getDogPic(); // Använder bara bilder från images-mappen
} else {
    driver();    // Hämtar raser och beskrivningar från API
    getDogPic(); // Hämtar bilder från API
}