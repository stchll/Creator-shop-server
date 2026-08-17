const loadingPage = document.querySelector(".loadingPage");
const goodsPart = document.querySelector(".goodsPart");
const wrap = document.querySelector(".wrap")

const URL = "https://creator-shop-server.onrender.com"

async function fetchGoods(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Error with fetching!");

            return;
        }

        const goods = await response.json();

        return goods
    } catch (error) {
        console.log(error);
    }
}

async function reloadProducts() {
    const products = await fetchGoods(URL + "/products")

    if (products) {
        goodsPart.innerHTML = ``

        for (let product of products) {
            const newProduct = document.createElement("div");
            newProduct.className = "card";

            const imageUrl = product.image.startsWith("http") ? product.image : `${URL}${product.image}`;

            newProduct.innerHTML = `
                <div class="imagePart">
                    <img src="${imageUrl}">
                </div>

                <div class="dataPart">
                    <div class="idlePage">
                        <h2>${product.title}</h2>

                        <p>${product.price}₴</p>
                    </div>

                    <div class="activePage">
                        <button><i class="fa-solid fa-cart-shopping"></i></button>
                    </div>
                </div>
            `

            const idlePart = newProduct.querySelector(".idlePage")
            const activePart = newProduct.querySelector(".activePage")

            newProduct.addEventListener("mouseenter" , (e) => {
                activePart.style.display = "flex";
                idlePart.style.display = "none"
            })

            newProduct.addEventListener("mouseleave" , (e) => {
                activePart.style.display = "none";
                idlePart.style.display = "block"
            })

            goodsPart.appendChild(newProduct)
        }
    }
}

reloadProducts()

setTimeout(() => {
    loadingPage.classList.add("hide");
    wrap.style.display = "flex"
}, 1400);
