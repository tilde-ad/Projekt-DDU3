async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();

    console.log(data);
}

getDogFact();

console.log("Hej")