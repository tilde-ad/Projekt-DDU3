testing - API
async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();
    console.log(data);
}

getDogFact();

class Dogbreed {
    //static Breeds = ["huskies", "rasker", "Collie"]  //här måste vo göra en request för att få dogbreedsen
    // men då måste vi kanske göra en static allbreeds funktion

    static Breeds = []
    static async fetchBreed() {
        let response = await fetch("https://dog.ceo/api/breeds/list/all")
        let data = await response.json()
        for (let breed in data.message) {
            Dogbreed.Breeds.push(breed)
        }
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
    await Dogbreed.fetchBreed()
    console.log(Dogbreed.Breeds)
}
driver()

