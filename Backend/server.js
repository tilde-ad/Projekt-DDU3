// Byt till false inför inlämning
const useDevMode = true;
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

async function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Access-Control-Allow-Origin", "*");
    headerCORS.append("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    headerCORS.append("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: headerCORS });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
        const html = await Deno.readTextFile("../Frontend/index.html");
        return new Response(html, {
            status: 200,
            headers: { "content-type": "text/html", ...headerCORS }
        });
    }

    if (request.method === "GET" && url.pathname === "/styles.css") {
        const css = await Deno.readTextFile("../Frontend/styles.css");
        return new Response(css, {
            status: 200,
            headers: { "content-type": "text/css", ...headerCORS }
        });
    }

    if (request.method === "GET" && url.pathname === "/script.js") {
        const js = await Deno.readTextFile("../Frontend/script.js");
        return new Response(js, {
            status: 200,
            headers: { "content-type": "application/javascript", ...headerCORS }
        });
    }

    if (request.method === "GET") {

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

        if (url.pathname === "/dogbreed") {

            let allBreeds = [];
            let currentPageUrl = "https://dogapi.dog/api/v2/breeds?page[size]=100";

            while (currentPageUrl) {
                const apiResponse = await fetch(currentPageUrl);
                const jsonData = await apiResponse.json();

                const breedsOnPage = jsonData.data.map(breed => {
                    return {
                        name: breed.attributes.name,
                        description: breed.attributes.description
                    };
                });

                allBreeds = allBreeds.concat(breedsOnPage);

                if (jsonData.links && jsonData.links.next) {
                    currentPageUrl = jsonData.links.next;
                } else {
                    currentPageUrl = null;
                }
            }

            return new Response(JSON.stringify(allBreeds), {
                status: 200,
                headers: headerCORS
            });
        }

        if (url.pathname === "/dogbreedsecond") {
            const response = await fetch("https://dog.ceo/api/breeds/list/all");
            const data = await response.json();
            const allBreeds = [];

            for (const breedName in data.message) {
                const subBreeds = data.message[breedName];

                if (subBreeds.length > 0) {
                    for (let i = 0; i < subBreeds.length; i++) {
                        const sub = subBreeds[i];
                        const fullName = sub + " " + breedName;
                        allBreeds.push(fullName);
                    }
                } else {
                    allBreeds.push(breedName);
                }
            }

            return new Response(JSON.stringify(allBreeds), {
                status: 200,
                headers: headerCORS
            });
        }

        if (url.pathname === "/dogfact") {
            if (useDevMode) {
                return new Response(JSON.stringify(arrayDogFact), {
                    status: 200,
                    headers: headerCORS
                });
            } else {
                const apiUrl = "https://dogapi.dog/api/v2/facts";
                const response = await fetch(apiUrl);
                const jsonData = await response.json();

                // Här hämtar vi bara själva texten (body) från varje faktaruta
                const factList = jsonData.data.map(item => {
                    return item.attributes.body;
                });

                return new Response(JSON.stringify(factList), {
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

        // Hämta favoriter
        if (url.pathname === "/favorite") {
            const username = url.searchParams.get("username");
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            var user = null;
            for (var i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username === username) {
                    user = data.accounts[i];
                    break;
                }
            }

            if (!user) {
                return new Response(JSON.stringify({ success: false, message: "User not found" }), {
                    status: 404,
                    headers: headerCORS
                });
            }

            return new Response(JSON.stringify({ success: true, favorites: user.favorites || [] }), {
                status: 200,
                headers: headerCORS
            });
        }
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
                return new Response(JSON.stringify({ success: false, message: "Username is already taken" }), {
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

        // Spara favorit
        if (url.pathname === "/favorite") {
            const body = await request.json();
            const username = body.username;
            const breed = body.breed;
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            let user = null;
            for (let i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username === username) {
                    user = data.accounts[i];
                    break;
                }
            }

            if (!user) {
                return new Response(JSON.stringify({ success: false, message: "User not found" }), {
                    status: 404,
                    headers: headerCORS
                });
            }

            if (!user.favorites) user.favorites = [];
            const breedLower = breed.toLowerCase();
            if (user.favorites.map(function (f) { return f.toLowerCase(); }).indexOf(breedLower) === -1) {
                user.favorites.push(breedLower);
                await Deno.writeTextFile("database.json", JSON.stringify(data, null, 2));
            }

            return new Response(JSON.stringify({ success: true, favorites: user.favorites }), {
                status: 200,
                headers: headerCORS
            });
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

    if (request.method === "DELETE") {
        if (url.pathname === "/favorite") {
            const body = await request.json();
            const username = body.username;
            const breed = body.breed;
            const file = await Deno.readTextFile("database.json");
            const data = JSON.parse(file);

            let user = null;
            for (let i = 0; i < data.accounts.length; i++) {
                if (data.accounts[i].username === username) {
                    user = data.accounts[i];
                    break;
                }
            }

            if (!user) {
                return new Response(JSON.stringify({ success: false, message: "User not found" }), {
                    status: 404,
                    headers: headerCORS
                });
            }

            if (!user.favorites) user.favorites = [];
            let index = -1;
            for (let j = 0; j < user.favorites.length; j++) {
                if (user.favorites[j].toLowerCase() === breed.toLowerCase()) {
                    index = j;
                    break;
                }
            }

            if (index !== -1) {
                user.favorites.splice(index, 1);
                await Deno.writeTextFile("database.json", JSON.stringify(data, null, 2));
                return new Response(JSON.stringify({ success: true, favorites: user.favorites || [] }), {
                    status: 200,
                    headers: headerCORS
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: "Breed not found in favorites" }), {
                    status: 404,
                    headers: headerCORS
                });
            }
        }
    }
}

Deno.serve(handler);
