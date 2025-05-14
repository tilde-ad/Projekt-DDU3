class Dogbreed {
    //static Breeds = ["huskies", "rasker", "Collie"]  //här måste vo göra en request för att få dogbreedsen
    // men då måste vi kanske göra en static allbreeds funktion
    static Breeds = []
    static Instances = [];

    constructor(name) {
        this.name = name;
    }

    static async fetchBreed() {
        let response = await fetch("http://localhost:8000/dogbreed");
        let data = await response.json();
        Dogbreed.Breeds = data;
        Dogbreed.Instances = data.map(breedName => new Dogbreed(breedName));
    }

    get dogBreed() {
        return this._dogBreed
    }
    set dogBreed(value) {
        if (!Dogbreed.Breeds.includes(value)) {
            console.log("error")
        }
        this._dogBreed = value
    }
}

async function driver() {
    await Dogbreed.fetchBreed();
    console.log(Dogbreed.Instances);
    if (Dogbreed.Instances.length > 0) {
        console.log(Dogbreed.Instances[0].name);
    }
}

driver()

