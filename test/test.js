
async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();

    const div = document.createElement("div");
    div.innerHTML = `<h2>Dog fact</h2><p>${data}</p>`
    document.body.appendChild(div);
}

async function getDogPic() {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    const img = document.createElement("img");
    img.src = data.message;
    img.style.maxWidth = "450px";
    img.style.height = "250px";
    img.style.objectFit = "cover";

    document.body.appendChild(img);
}

async function getRandomBreedAndInfo() {
    const response = await fetch("http://localhost:8000/dogbreed");
    const data = await response.json();

    const breed = data[Math.floor(Math.random() * data.length)];
    const div = document.createElement("div");
    div.innerHTML = `<h2>Dogbreed: ${breed.name}</h2><p>${breed.description}</p>`;
    document.body.appendChild(div);
}

async function runTest() {
    await getDogFact();
    await getDogPic();
    await getRandomBreedAndInfo();
}

runTest();



