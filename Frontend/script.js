//ta bort denna innan inlämning
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

    // async fetchBreed() {
    //     let response = await fetch("http://localhost:8000/dogbreed");
    //     let data = await response.json();
    //     this.breeds = data;
    //     this.instances = data.map(breedObj => new Dog(breedObj));
    // }


    //denna ska raders innan inlämning och den ovan ska kommenteras in igen

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


//få bilder och blanda dem
const memoryContainer = document.getElementById("memory-Container")
async function getDogPic() {
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
    return commonBreeds;
}



// async function findMatchingBreedtoPic() {
//     const breeds = await getCommonBreeds();
//     const picURLs = await getDogPic();  // picURLs är en array med URL-strängar

//     const matchedPics = [];
//     for (let url of picURLs) {
//         const breedFromURL = url.split("/")[4];
//         if (breeds.includes(breedFromURL)) {
//             matchedPics.push(breedFromURL);
//         }
//     }
//     console.log(matchedPics);
// }


//functionsanrop
// findMatchingBreedtoPic()
driver();
getDogPic();
getCommonBreeds();