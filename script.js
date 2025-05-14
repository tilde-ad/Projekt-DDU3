class Dogbreed {
    //static Breeds = ["huskies", "rasker", "Collie"]  //här måste vo göra en request för att få dogbreedsen
    // men då måste vi kanske göra en static allbreeds funktion
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
    if (Dogbreed.Instances.length > 0) {
        console.log(Dogbreed.Instances[0].name, Dogbreed.Instances[0].description);
    }
}

driver()

