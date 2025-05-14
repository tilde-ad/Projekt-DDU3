class Dogbreed {
    static Breeds = []
    static Instances = [];

    constructor({ name, description }) {
        this.name = name;
        this.description = description;
    }

    static async fetchBreed() {
        let response = await fetch("http://localhost:8000/dogbreed");
        let data = await response.json();
        Dogbreed.Breeds = data;
        Dogbreed.Instances = data.map(breedObj => new Dogbreed(breedObj));
    }

    get dogBreed() {
        return this._dogBreed
    }
    set dogBreed(value) {
        if (!Dogbreed.Breeds.some(b => b.name === value)) {
            console.log("error");
        }
        this._dogBreed = value;
    }
}

async function driver() {
    await Dogbreed.fetchBreed();
    console.log(Dogbreed.Instances);
}

driver();


//få bilder och blanda dem
async function getDogPic() {
    const dogPics = [];

    // Steg 1: Hämta 8 unika hundbilder
    for (let i = 0; i < 8; i++) {
        const response = await fetch("http://localhost:8000/dogPic");
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
        img.style.width = "200px";
        img.style.height = "200px";
        img.style.objectFit = "cover";

        const div = document.getElementById("pic" + (i + 1));
        if (div) {
            div.appendChild(img);
        }
    }
}

getDogPic();