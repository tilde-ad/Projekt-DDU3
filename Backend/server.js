// Byt till false inför inlämning
const useDevMode = true;

// === För utvecklingsläge: förladdade data ===
let arrayDogFact = [];

// === Hämta och spara 20 hundfakta lokalt (endast i dev-läge) ===
if (useDevMode) {
    for (let i = 0; i < 20; i++) {
        const apiUrl = "https://dogapi.dog/api/v2/facts";
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        arrayDogFact.push(data.data[0].attributes.body);
    }
}

// === SERVER ===

let acounts = []
async function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Access-Control-Allow-Origin", "*");
    headerCORS.append("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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

        if (url.pathname === "/getAllAccounts") {
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            // Returnera hela data (t.ex. alla accounts)
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: headerCORS,
            });
        }
        return new Response("Not found", {
            status: 404,
            headers: headerCORS
        });
    }

    if (request.method === "POST") {

        if (url.pathname === "/savedAccounts") {
            // Hämta nuvarande data
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            // Läs in det nya kontot
            const newAccount = await request.json();

            const existing = data.accounts.find(acc => acc.username === newAccount.username);
            if (existing) {
                return new Response(JSON.stringify({ success: false, message: "Användarnamnet är redan upptaget" }), {
                    status: 409,
                    headers: headerCORS
                });
            }

            // Lägg till det i arrayen
            data.accounts.push(newAccount);

            // Spara tillbaka till filen
            await Deno.writeTextFile("database.json", JSON.stringify(data, null, 2));

            return new Response(JSON.stringify({ success: true, message: "Account saved!" }), {
                status: 200,
                headers: headerCORS
            });
        }

        if (url.pathname === "/login") {
            const body = await request.json();
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            // Kontrollera om kontot finns
            const found = data.accounts.find(
                acc => acc.username === body.username && acc.password === body.password
            );

            if (found) {
                return new Response(JSON.stringify({ success: true, message: "Login successful" }), {
                    status: 200,
                    headers: headerCORS
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), {
                    status: 401,
                    headers: headerCORS
                });
            }
        }

    }

    if (request.method === "PATCH") {
        if (url.pathname === "/highscore") {
            // Hämta nuvarande data
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);


            const { highscore, currentUser } = await request.json();

            // Hitta användarkontot med matchande username
            const userAccount = data.accounts.find(account => account.username === currentUser);

            if (userAccount) {
                userAccount.highscore = highscore;

                await Deno.writeTextFile("database.json", JSON.stringify(data, null, 2));

                return new Response(JSON.stringify({ success: true, message: "Highscore updated!" }), {
                    status: 200,
                    headers: headerCORS,
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: "User not found" }), {
                    status: 404,
                    headers: headerCORS,
                });
            }
        }
    }


}

Deno.serve(handler);
