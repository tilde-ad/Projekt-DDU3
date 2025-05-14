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
        const apiUrl = "https://dog-facts-api.herokuapp.com/api/v1/resources/dogs?number=1";
        const apiResponse = await fetch(apiUrl);
        const data = await apiResponse.json();
        return new Response(JSON.stringify(data),
            {
                status: 200,
                headers: headerCORS
            });
    }

    return new Response("Not found", { status: 404, headers: headerCORS });
}

Deno.serve(handler);