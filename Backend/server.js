// Byt till false inför inlämning
const useDevMode = false;

// === För utvecklingsläge: förladdade data ===
let arrayDogFact = [];
let breedDescriptions = [];

// === Hämta och spara 20 hundfakta lokalt (endast i dev-läge) ===
if (useDevMode) {
    for (let i = 0; i < 20; i++) {
        const apiUrl = "https://dogapi.dog/api/v2/facts";
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        arrayDogFact.push(data.data[0].attributes.body);
    }
}

// === Hämta 67 raser med beskrivning (endast i dev-läge) ===
async function fetchBreedDescriptions() {
    const ceoResponse = await fetch("https://dog.ceo/api/breeds/list/all");
    const ceoData = await ceoResponse.json();
    const ceoBreeds = [];

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

    let dogApiBreeds = [];
    let apiUrl = "https://dogapi.dog/api/v2/breeds?page[size]=100";

    while (apiUrl) {
        const res = await fetch(apiUrl);
        const data = await res.json();
        for (let i = 0; i < data.data.length; i++) {
            dogApiBreeds.push(data.data[i]);
        }
        apiUrl = data.links?.next || null;
    }

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

        breedDescriptions.push({ name, description: foundDescription });
    }
}

if (useDevMode) {
    await fetchBreedDescriptions();
}

// === SERVER ===
async function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Access-Control-Allow-Origin", "*");
    headerCORS.append("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    headerCORS.append("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: headerCORS });
    }

    if (request.method === "GET") {
        // Hundbild (med eller utan ras)
        if (url.pathname === "/dogpic") {
            const breed = url.searchParams.get("breed");
            let apiUrl = "https://dog.ceo/api/breeds/image/random";

            if (breed) {
                apiUrl = `https://dog.ceo/api/breed/${breed}/images/random`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: headerCORS
            });
        }

        // Hämta alla hundraser (med beskrivningar)
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
                apiUrl = data.links?.next || null;
            }
            return new Response(JSON.stringify(breeds), {
                status: 200,
                headers: headerCORS
            });
        }

        // Gemensamma raser från dog.ceo
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

        // Dev-version av dogbreed + beskrivning
        if (url.pathname === "/dogbreedseconddesc") {
            if (useDevMode) {
                return new Response(JSON.stringify(breedDescriptions), {
                    status: 200,
                    headers: headerCORS
                });
            } else {
                return new Response("Route not available in live mode", {
                    status: 404,
                    headers: headerCORS
                });
            }
        }

        // Fakta om hundar
        if (url.pathname === "/dogfact") {
            if (useDevMode) {
                return new Response(JSON.stringify(arrayDogFact), {
                    status: 200,
                    headers: headerCORS
                });
            } else {
                const apiUrl = "https://dogapi.dog/api/v2/facts";
                const apiResponse = await fetch(apiUrl);
                const data = await apiResponse.json();
                const facts = data.data.map(fact => fact.attributes.body);
                return new Response(JSON.stringify(facts), {
                    status: 200,
                    headers: headerCORS
                });
            }
        }

        return new Response("Not found", {
            status: 404,
            headers: headerCORS
        });
    }
}

Deno.serve(handler);
