//Denna rad tas bort innan inlämning
const useDevMode = true; // ändra till false inför inlämning


//dogfact 
let arrayDogFact = [];
for (let i = 0; i < 20; i++) {
    const apiUrl = "https://dogapi.dog/api/v2/facts";
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    arrayDogFact.push(data.data[0].attributes.body);
}


//beskrivning av 67 hundraser 
let breedDescriptions = [];

async function fetchBreedDescriptions() {
    // 1. Hämta alla raser från dog.ceo
    const ceoResponse = await fetch("https://dog.ceo/api/breeds/list/all");
    const ceoData = await ceoResponse.json();
    const ceoBreeds = [];

    // Bygg ceoBreeds-listan med vanliga loopar
    const breedEntries = Object.entries(ceoData.message);
    for (let i = 0; i < breedEntries.length; i++) {
        const breed = breedEntries[i][0];
        const subBreeds = breedEntries[i][1];

        if (subBreeds.length === 0) {
            ceoBreeds.push(breed);
        } else {
            for (let j = 0; j < subBreeds.length; j++) {
                ceoBreeds.push(subBreeds[j] + " " + breed);
            }
        }
    }

    // 2. Hämta alla raser med beskrivning från dogapi.dog
    let dogApiBreeds = [];
    let apiUrl = "https://dogapi.dog/api/v2/breeds?page[size]=100";

    while (apiUrl) {
        const res = await fetch(apiUrl);
        const data = await res.json();
        for (let i = 0; i < data.data.length; i++) {
            dogApiBreeds.push(data.data[i]);
        }
        if (data.links && data.links.next) {
            apiUrl = data.links.next;
        } else {
            apiUrl = null;
        }
    }

    // 3. Matcha varje ceo-breed mot dogapi-breed och spara namn + beskrivning
    for (let i = 0; i < ceoBreeds.length; i++) {
        const name = ceoBreeds[i];
        let foundDescription = "Ingen beskrivning hittades.";

        for (let j = 0; j < dogApiBreeds.length; j++) {
            const breedName = dogApiBreeds[j].attributes.name.toLowerCase();
            if (breedName.includes(name.toLowerCase())) {
                foundDescription = dogApiBreeds[j].attributes.description;
                break;
            }
        }

        breedDescriptions.push({
            name: name,
            description: foundDescription
        });
    }
}

await fetchBreedDescriptions();



//SERVERN
async function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Access-Control-Allow-Origin", "*");
    headerCORS.append("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headerCORS.append("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return new Response(null,
            { headers: headerCORS });
    }

    if (request.method === "GET") {

        if (url.pathname === "/dogpic") {
            const urlPic = "https://dog.ceo/api/breeds/image/random";
            const response = await fetch(urlPic);
            const data = await response.json();

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: headerCORS
            });
        }

        if (url.pathname === "/dogbreed") {
            let breeds = [];
            let apiUrl = "https://dogapi.dog/api/v2/breeds?page[size]=100";
            while (apiUrl) {
                const apiResponse = await fetch(apiUrl);
                const data = await apiResponse.json();
                breeds = breeds.concat(
                    data.data.map(breed => ({
                        name: breed.attributes.name,
                        description: breed.attributes.description
                    }))
                );
                apiUrl = data.links && data.links.next ? data.links.next : null;
            }
            return new Response(JSON.stringify(breeds), {
                status: 200,
                headers: headerCORS
            });
        }

        //Denna ska tas bort innan inlämning
        if (url.pathname === "/dogbreedseconddesc") {
            return new Response(JSON.stringify(breedDescriptions), {
                status: 200,
                headers: headerCORS
            });
        }


        if (url.pathname === "/dogbreedsecond") {
            const ceoResponse = await fetch("https://dog.ceo/api/breeds/list/all");
            const ceoData = await ceoResponse.json();
            const ceoBreeds = [];

            for (const [breed, subBreeds] of Object.entries(ceoData.message)) {
                if (subBreeds.length === 0) {
                    ceoBreeds.push(breed);
                } else {
                    subBreeds.forEach(sub => {
                        ceoBreeds.push(`${sub} ${breed}`);
                    });
                }
            }

            return new Response(JSON.stringify(ceoBreeds), {
                status: 200,
                headers: headerCORS
            });
        }


        // if (url.pathname === "/dogfact") {
        //     const apiUrl = arrayDogFact;
        //     // "https://dogapi.dog/api/v2/facts";
        //     const apiResponse = await fetch(apiUrl);
        //     const data = await apiResponse.json();
        //     const facts = data.data.map(fact => fact.attributes.body);
        //     return new Response(JSON.stringify(facts),
        //         {
        //             status: 200,
        //             headers: headerCORS
        //         });
        // }

        //denna ska tas bort innan inlämning, denna hämtar en hundfakta från vår array
        if (url.pathname === "/dogfact") {
            return new Response(JSON.stringify(arrayDogFact), {
                status: 200,
                headers: headerCORS
            });
        }

        return new Response("Not found", {
            status: 404,
            headers: headerCORS
        });

    }


}


Deno.serve(handler);