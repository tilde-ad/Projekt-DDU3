//test 1 - hundfakta
async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();

    const index = Math.floor(Math.random() * data.length);
    const fact = data[index];
    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 1: Dog fact</h2><p>${fact}</p>`;
    document.body.appendChild(div);
}

//test 2 - bild
async function getDogPic() {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    // Skapa rubriken
    const heading = document.createElement("h2");
    heading.textContent = "Test 2: A picture of a random dog breed";

    const img = document.createElement("img");
    img.src = data.message;
    img.style.maxWidth = "450px";
    img.style.height = "250px";
    img.style.objectFit = "cover";

    document.body.appendChild(heading);
    document.body.appendChild(img);
}

//test 3 - beskrivning av hundras
async function getRandomBreedAndInfo() {
    const response = await fetch("http://localhost:8000/dogbreed");
    const data = await response.json();

    const index = Math.floor(Math.random() * data.length);
    const breed = data[index];

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 3: Dogbreed: ${breed.name}</h2><p>${breed.description}</p>`;

    const div2 = document.createElement("div");
    div2.innerHTML = `<h3>Alla hundraser från API1 (dogapi.dog):</h3>`

    div2.style.height = "400px";
    div2.style.width = "500px"
    div2.style.overflowY = "auto";
    div2.style.border = "1px solid black";

    const ol = document.createElement("ol");
    ol.style.columns = "2";
    ol.style.columnGap = "20px";
    for (let i = 0; i < data.length; i++) {
        const li = document.createElement("li");
        li.textContent = data[i].name;
        ol.appendChild(li);
    }

    div2.appendChild(ol);
    document.body.appendChild(div);
    document.body.appendChild(div2);
}

//test 4 - array av hundar
async function getArrayOfDogs() {
    const response = await fetch("http://localhost:8000/dogbreedsecond");
    const data = await response.json();

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 4: En array hundraser från API2 (dog.ceo)</h2>`

    const div2 = document.createElement("div");
    div2.style.height = "400px";
    div2.style.width = "500px"
    div2.style.overflowY = "auto";
    div2.style.border = "1px solid black";

    const ol = document.createElement("ol");
    ol.style.columns = "2";
    ol.style.columnGap = "20px";

    for (let i = 0; i < data.length; i++) {
        const li = document.createElement("li");
        li.textContent = data[i];
        ol.appendChild(li);
    }

    div2.appendChild(ol);
    document.body.appendChild(div);
    document.body.appendChild(div2);
}

//test 5 - skapa konto
async function createAcount() {
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "testuser123",
            password: "testpassword"
        })
    }
    const response = await fetch("http://localhost:8000/savedAccounts", options);

    const div = document.createElement("div");

    if (response.status === 200) {
        div.innerHTML = `<h2>Test 5: Create a account</h2><p>An account has been created.</p>`
        document.body.appendChild(div);
    } else {
        div.innerHTML = `<h2>Test 5: Create a account</h2><p>An account could not be created.</p>`
        document.body.appendChild(div);
    }
}

//test 6 - logga in
async function loginToAccount() {
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: "testuser123",
            password: "testpassword"
        })
    }
    const response = await fetch("http://localhost:8000/login", options);

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 6: Login to account</h2>`;

    if (response.status === 200) {
        div.innerHTML += `<p>Login successful</p>`
    } else {
        div.innerHTML += `<p>Login failed</p>`
    }
    document.body.appendChild(div);
}

// test 7 - uppdatera highscore
async function updateHighscoreTest() {
    const options = {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentUser: "testuser123",
            highscore: 26
        })
    };

    const response = await fetch("http://localhost:8000/highscore", options);

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 7: Update Highscore</h2>`;

    if (response.status === 200) {
        div.innerHTML += `<p>Highscore updated successfully</p>`;
    } else {
        div.innerHTML += `<p>Failed to update highscore</p>`;
    }

    document.body.appendChild(div);
}

// Test 8 – Hämta alla konton
async function getAllAccountsTest() {
    const response = await fetch("http://localhost:8000/getAllAccounts");

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 8: Hämta alla konton</h2>`;

    if (response.status === 200) {
        const data = await response.json();

        // Kontrollera att det finns en accounts-array
        if (Array.isArray(data.accounts)) {
            div.innerHTML += `<p>Lyckades hämta ${data.accounts.length} konto(n).</p>`;

            // Valfri: kontrollera om ett specifikt konto finns (ex. testuser123)
            const found = data.accounts.find(acc => acc.username === "testuser123");
            if (found) {
                div.innerHTML += `<p>Kontot 'testuser123' hittades.</p>`;
            } else {
                div.innerHTML += `<p>Kontot 'testuser123' hittades inte.</p>`;
            }

        } else {
            div.innerHTML += `<p>Felaktigt format på response-body (saknar accounts-array).</p>`;
        }

    } else {
        div.innerHTML += `<p>Misslyckades att hämta konton. Statuskod: ${response.status}</p>`;
    }

    document.body.appendChild(div);
}


async function runTest() {
    await getDogFact();
    await getDogPic();
    await getRandomBreedAndInfo();
    await getArrayOfDogs();
    await createAcount();
    await loginToAccount();
    await updateHighscoreTest();
    await getAllAccountsTest();
}

runTest();



