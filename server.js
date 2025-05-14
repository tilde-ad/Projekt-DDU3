function handler(request) {
    const url = new URL(request.url);

    const headerCORS = new Headers();
    headerCORS.append("Acess-Control-Allow-Origin", "*");
    headerCORS.append("Acess-Control-Allow-Methods", "GET, POST DELETE, OPTIONS");
    headerCORS.append("Acess-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        return new Response(null,
            { headers: headerCORS });
    }

}

Deno.server(handler);