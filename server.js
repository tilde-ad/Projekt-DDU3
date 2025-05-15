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

        if (url.pathname === "/dogfact") {
            const apiUrl = "https://dogapi.dog/api/v2/facts";
            const apiResponse = await fetch(apiUrl);
            const data = await apiResponse.json();
            const facts = data.data.map(fact => fact.attributes.body);
            return new Response(JSON.stringify(facts),
                {
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