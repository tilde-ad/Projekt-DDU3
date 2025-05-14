
async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();

    const div = document.createElement("div");
    div.textContent = data;
    document.body.appendChild(div);
}

async function getDogPic() {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    const img = document.createElement("img");
    img.src = data.message;
    img.style.width = "250px";
    img.style.height = "250px";
    img.style.objectFit = "cover";

    document.body.appendChild(img);
}

async function runTest() {
    await getDogFact();
    await getDogPic();
}

runTest();



