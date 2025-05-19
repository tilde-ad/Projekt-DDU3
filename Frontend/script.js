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
        let response = await fetch("http://localhost:8000/dogbreed");
        let data = await response.json();
        this.breeds = data;
        this.instances = data.map(breedObj => new Dog(breedObj));
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


//få bilder och blanda dem
const memoryContainer = document.getElementById("memory-Container")
async function getDogPic() {
    const dogPics = [];

    // Steg 1: Hämta 8 unika hundbilder
    for (let i = 0; i < 10; i++) {
        const response = await fetch("http://localhost:8000/dogpic");
        const data = await response.json();
        dogPics.push(data.message); // Bara bild-URL
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

//Kommer nog ta bort denna sen
// async function testbreedlist() {
//     const response = await fetch("http://localhost:8000/dogbreedsecond");
//     const data = await response.json();

//     console.log(data);
// }

// testbreedlist();

//Tar gemensamma hundar från api1 och api2 och skapar en ny array
async function getCommonBreeds() {
    // Hämta redan platt array från din backend
    const ceoResponse = await fetch("http://localhost:8000/dogbreedsecond");
    const ceoBreeds = (await ceoResponse.json()).map(b => b.toLowerCase());

    const dogApiResponse = await fetch("http://localhost:8000/dogbreed");
    const dogApiBreeds = (await dogApiResponse.json()).map(b => b.name.toLowerCase());

    const commonBreeds = ceoBreeds.filter(breed => dogApiBreeds.includes(breed));
    console.log(commonBreeds);
    return commonBreeds;
}

async function findMatchingBreedtoPic() {
    const breeds = await getCommonBreeds();
    const picURLs = await getDogPic();  // picURLs är en array med URL-strängar
    
    const matchedPics = [];
    for (let url of picURLs) {
        const breedFromURL = url.split("/")[4];
        if(breeds.includes(breedFromURL)){
            matchedPics.push(breedFromURL);
        }
    }
    console.log(matchedPics);
}

//functionsanrop
findMatchingBreedtoPic()
driver();
getDogPic();

getCommonBreeds();