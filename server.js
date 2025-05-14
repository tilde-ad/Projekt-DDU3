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

    if (url.pathname === "/dogbreed") {
        const apiUrl = "https://dog.ceo/api/breeds/list/all";
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        const breeds = Object.keys(data.message);
        return new Response(JSON.stringify(breeds),
            {
                status: 200,
                headers: headerCORS
            });
    }

    return new Response("Not found", { status: 404, headers: headerCORS });
}

Deno.serve(handler);