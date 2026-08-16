const productsBody = document.querySelector(".products-table tbody");

const creatingModal = document.querySelector(".create-product-modal");

const createModalOpenBtn = document.getElementById("create-modal-open");
const createModalCloseBtn = document.getElementById("close-create-modal");

const createProductForm = document.getElementById("create-product-form");

const URL = "http://localhost:3000";

async function fetchProducts() {
    try {
        const response = await fetch(URL + "/products");

        if (!response.ok) {
            console.error("Error while fetching products");
            return;
        }

        const products = await response.json();
        return products;
    } catch(error) {
        console.error("Can't fetch products!");
    }
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`${URL}/product/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            console.error("Can't delete a product!");
            return;
        }

        await reloadProducts();
    } catch(error) {
        console.error("Can't delete!", error);
    }
}

async function reloadProducts() {
    const products = await fetchProducts();

    if (products) {
        productsBody.innerHTML = "";

        for (let product of products) {
            const newElement = document.createElement("tr");

            const imageUrl = product.image.startsWith("http") ? product.image : `${URL}${product.image}`;

            newElement.innerHTML = `
                <td><img src="${imageUrl}" alt="${product.title}"></td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.price}</td>
                <td>${product.rating}</td>
                <td>
                    <button>Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;

            const deleteBtn = newElement.querySelector(".delete-btn");
            deleteBtn.addEventListener("click", () => {
                deleteProduct(product._id || product.id);
                deleteBtn.textContent = "Deleting...";
            });

            productsBody.appendChild(newElement);
        }
    }
}

createProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(createProductForm);

    try {
        const response = await fetch(`${URL}/product`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            console.error("Error creating product");
            return;
        }

        createProductForm.reset();
        creatingModal.style.display = "none";
        await reloadProducts();
    } catch (error) {
        console.error("Can't create product!", error);
    }
});

reloadProducts();

createModalOpenBtn.addEventListener("click", () => {
    creatingModal.style.display = "block";
});

createModalCloseBtn.addEventListener("click", () => {
    creatingModal.style.display = "none";
});