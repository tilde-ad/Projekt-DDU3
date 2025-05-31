//test 1
async function getDogFact() {
    const response = await fetch("http://localhost:8000/dogfact");
    const data = await response.json();

    const index = Math.floor(Math.random() * data.length);
    const fact = data[index];
    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 1: Dog fact</h2><p>${fact}</p>`;
    document.body.appendChild(div);

    markTestAsComplete("test1");
}

//test 2
async function getDogPic() {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    const heading = document.createElement("h2");
    heading.textContent = "Test 2: A picture of a random dog breed";

    const img = document.createElement("img");
    img.src = data.message;
    img.style.maxWidth = "450px";
    img.style.height = "500px";
    img.style.objectFit = "contain";

    document.body.appendChild(heading);
    document.body.appendChild(img);

    markTestAsComplete("test2");
}

//test 3
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

    markTestAsComplete("test3");
}

//test 4
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

    markTestAsComplete("test4");
}

//test 5
async function createAcount() {
    const userData = {
        username: "testuser123",
        password: "testpassword"
    };

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    }
    const response = await fetch("http://localhost:8000/savedAccounts", options);

    const div = document.createElement("div");

    if (response.status === 200) {
        div.innerHTML = `<h2>Test 5: Create a account</h2><p>An account has been created.</p>
        <p>Username: ${userData.username}, Password: ${userData.password}</p>`
        document.body.appendChild(div);
    } else {
        div.innerHTML = `<h2>Test 5: Create a account</h2><p>An account could not be created.</p>`
        document.body.appendChild(div);
    }

    markTestAsComplete("test5");
}

//test 6
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

    markTestAsComplete("test6");
}

// test 7
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

    markTestAsComplete("test7");
}

//test 8
async function getAllAccountsTest() {
    const response = await fetch("http://localhost:8000/getAllAccounts");

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 8: Get all accounts</h2>`;

    if (response.status === 200) {
        const data = await response.json();

        div.innerHTML += `<p>Successfully retrieved ${data.accounts.length} account(s).</p>`;

        const found = data.accounts.find(acc => acc.username === "testuser123");
        if (found) {
            div.innerHTML += `<p>The account "testuser123" has been found.</p>`;
        } else {
            div.innerHTML += `<p>The account "testuser123" was not found.</p>`;
        }

    } else {
        div.innerHTML += `<p>Failed to retrieve accounts. Status code: ${response.status}</p>`;
    }

    document.body.appendChild(div);

    markTestAsComplete("test8");
}

//test 9 
async function testSaveFavorite() {
    const testData = {
        username: "testuser123",
        breeds: ["Shetland Sheepdog", "Dvärgschnauzer", "Border Collie", "Rottweiler"]
    };

    const savedFavorites = [];

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 9: Save Favorite</h2>`;

    for (const breed of testData.breeds) {
        const response = await fetch("http://localhost:8000/favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: testData.username, breed })
        });

        if (response.status === 200) {
            savedFavorites.push(breed.toLocaleLowerCase());
        } else {
            div.innerHTML += `<p>Failed to save breed: ${breed}</p>`;
        }
    }

    if (savedFavorites.length > 0) {
        div.innerHTML += `<p>Successfully saved the following breeds:</p>`;
        const ul = document.createElement("ul");

        for (let i = 0; i < savedFavorites.length; i++) {
            const li = document.createElement("li");
            li.textContent = savedFavorites[i];
            ul.appendChild(li);
        }

        div.appendChild(ul);
    }
    document.body.appendChild(div);

    markTestAsComplete("test9");
}

async function testGetFavoritesFromUser() {
    const username = "testuser123";

    const response = await fetch(`http://localhost:8000/favorite?username=${username}`);
    const data = await response.json();
    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 10: Get Favorites for a specific user</h2>`;

    if (response.status === 200) {
        div.innerHTML += `<p>Favorites for ${username}:</p>`;
        const ul = document.createElement("ul");
        for (let i = 0; i < data.favorites.length; i++) {
            const li = document.createElement("li");
            li.textContent = data.favorites[i];
            ul.appendChild(li);
        }
        div.appendChild(ul);
    } else {
        div.innerHTML += `<p>Failed to retrieve favorites.</p>`;
    }

    document.body.appendChild(div);
    markTestAsComplete("test10");
}

//test 11
async function testDeleteFavorite() {
    const username = "testuser123";
    const breedToDelete = "Rottweiler";

    const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, breed: breedToDelete })
    };

    const response = await fetch("http://localhost:8000/favorite", options);

    const div = document.createElement("div");
    div.innerHTML = `<h2>Test 11: Delete Favorite</h2>`;

    if (response.status === 200) {
        const data = await response.json();
        div.innerHTML += `<p>The breed "${breedToDelete}" was successfully removed.</p>`;
        div.innerHTML += `<p>Updated favorites:</p>`;
        const ul = document.createElement("ul");
        for (let i = 0; i < data.favorites.length; i++) {
            const li = document.createElement("li");
            li.textContent = data.favorites[i];
            ul.appendChild(li);
        }
        div.appendChild(ul);
    } else {
        const data = await response.json();
        div.innerHTML += `<p>Failed to delete breed "${breedToDelete}".</p>`;
        div.innerHTML += `<p>Message from server: ${data.message}</p>`;
    }

    document.body.appendChild(div);

    markTestAsComplete("test11");
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
    await testSaveFavorite();
    await testGetFavoritesFromUser();
    await testDeleteFavorite();
}

runTest();