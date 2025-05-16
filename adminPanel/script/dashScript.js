
import { addBook } from '../../firebase.js';
import {  getBooks } from '../../firebase.js';
import {  deleteBook } from '../../firebase.js';

import {  updateBook } from '../../firebase.js';
import { signOutUser } from '../../firebase.js'; 

document.addEventListener("DOMContentLoaded", () => {
const content = document.getElementById("content");
const addBookForm = document.getElementById("add-book-form");
const alertBox = document.getElementById("alert-box");

const tablealertBox = document.getElementById("books-table-alert");
const toggleBtn = document.getElementById("toggleBtn");
const imageInput = document.getElementById("book-image");
const previewImg = document.getElementById("preview-img");
const categorySelect = document.getElementById("book-category");

const showAlert = (message, type = "success") => {
    alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
};

const showAlertTable = (message, type = "success") => {
    tablealertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
};

window.addEventListener("load", () => content.classList.add("loaded"));
toggleBtn.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
});


//image
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
        previewImg.src = reader.result;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
    } else {
    previewImg.src = "";
    previewImg.style.display = "none";
    }
});

//=======================================================================================

    const insertSection = document.getElementById("insert-section");
    const viewSection = document.getElementById("view-section");

    const showInsertBtn = document.getElementById("show-insert");
    const showViewBtn = document.getElementById("show-view");

    const navItems = document.querySelectorAll(".nav-item");
    function setActive(el) {
    navItems.forEach(item => item.classList.remove("active"));
    el.classList.add("active");
    }
setActive(showInsertBtn);
    showInsertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    insertSection.style.display = "block";
    viewSection.style.display = "none";
    setActive(showInsertBtn);
    });

    showViewBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    insertSection.style.display = "none";
    viewSection.style.display = "block";
    setActive(showViewBtn);
    await renderBooksTable(); 
});


//=======================================================================================
//  form 
addBookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const price = parseFloat(document.getElementById("book-price").value);
    const stock = parseInt(document.getElementById("book-stock").value);
    const description = document.getElementById("book-description").value.trim();
    const category = categorySelect.value;
    const imageFile = imageInput.files[0];
    const timestamp = Date.now();
    const bookId = `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

// Validate 
    if (!title || title.length < 5) return showAlert("Title must be at least 5 characters.", "danger");
    if (!author || author.length < 3) return showAlert("Author must be at least 3 characters.", "danger");
    if (isNaN(price) || price < 0) return showAlert("Price must be a valid positive number.", "danger");
    if (isNaN(stock) || stock < 0) return showAlert("Stock must be a valid positive number.", "danger");
    if (!description || description.length < 10) return showAlert("Description must be at least 10 characters.", "danger");
    if (!category) return showAlert("Please select a book category.", "danger");
    if (!imageFile || !imageFile.type.startsWith("image/")) return showAlert("Please select a valid image file.", "danger");

// book data
    const bookData = {
    bookId, 
    title,
    author,
    category,
    price,
    stock,
    description
    };

    //add to Firebase
    const result = await addBook(bookData);

    if (result.success) {
    showAlert(`Book added successfully! ID: ${result.id}`, "success");
    addBookForm.reset();
    previewImg.src = "";
    previewImg.style.display = "none";
    } else {
    showAlert(`Error: ${result.error.message}`, "danger");
    }
});


//=============================================================
// get books
async function renderBooksTable() {
    const tableBody = document.getElementById("books-table-body");
    tableBody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";
    const result = await getBooks();
    if (!result.success) {
    tableBody.innerHTML = `<tr><td colspan="8">Error loading books: ${result.error.message}</td></tr>`;
    return;
    }
    if (result.books.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='8'>No books found.</td></tr>";
    return;
    }
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteBookModal'), { backdrop: 'static', keyboard: false });
    tableBody.innerHTML = "";

    result.books.forEach(book => {
    const row = document.createElement("tr");
    const description = book.description.length > 100 
        ? book.description.split(" ").slice(0, 30).join(" ") + '...' 
        : book.description;

    row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>$${book.price.toFixed(2)}</td>
        <td>${book.stock}</td>
        <td>${description}</td>
        <td>${book.imageUrl ? `<img src="${book.imageUrl}" alt="${book.title}" style="max-width: 60px;">` : 'None'}</td>
        <td>
        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${book.id}" title="Edit">
            <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${book.id}" data-title="${book.title}" title="Delete">
            <i class="bi bi-trash"></i>
        </button>
        </td>
    `;
    tableBody.appendChild(row);
    });

//=====================================================================================
//edit and delete buttons
    tableBody.addEventListener('click', async (e) => {
    const target = e.target.closest('button');
    if (!target) return;
    const bookId = target.dataset.id;

    if (target.classList.contains('edit-btn')) {
        const book = result.books.find(b => b.id === bookId);
        if (book) {
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('edit-book-title').value = book.title;
        document.getElementById('edit-book-author').value = book.author;
        document.getElementById('edit-book-category').value = book.category;
        document.getElementById('edit-book-price').value = book.price;
        document.getElementById('edit-book-stock').value = book.stock;
        document.getElementById('edit-book-description').value = book.description;

        const modal = new bootstrap.Modal(document.getElementById('editBookModal'));
            modal.show();
    }
    }

//=========================================================================================
    //delete
    else if (target.classList.contains('delete-btn')) {
        document.getElementById('delete-book-title').textContent = target.dataset.title;
        document.getElementById('confirm-delete-book').dataset.id = bookId;
        deleteModal.show();
    }
    });
//delete from firebase
    document.getElementById('confirm-delete-book').addEventListener('click', async () => {
    const bookId = document.getElementById('confirm-delete-book').dataset.id;
    try {
        await deleteBook(bookId);
        deleteModal.hide();
        renderBooksTable();
        return showAlertTable("Book deleted successfully!", "success", "books-table-alert");
    } catch (error) {
        deleteModal.hide();
        return showAlertTable("Error deleting book: " + error.message, "danger", "books-table-alert");
    }
    });
    document.getElementById('cancel-delete-book').addEventListener('click', async () => {
        deleteModal.hide();
    });

}
// cancel edit
document.getElementById('edit-cancel').addEventListener('click', async () => {
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
    editModal.hide();
    });
// Save changes from edit modal
document.getElementById('save-book-changes').addEventListener('click', async () => {
    const bookId = document.getElementById('edit-book-id').value;
    const updatedBook = {
    title: document.getElementById('edit-book-title').value,
    author: document.getElementById('edit-book-author').value,
    category: document.getElementById('edit-book-category').value,
    price: parseFloat(document.getElementById('edit-book-price').value),
    stock: parseInt(document.getElementById('edit-book-stock').value),
    description: document.getElementById('edit-book-description').value
    };

    try {
    await updateBook(bookId, updatedBook);
    
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
    editModal.hide();
    renderBooksTable();
    return showAlertTable("Book updated successfully!", "success", "books-table-alert");
    } catch (error) {
    return showAlertTable("Error updating book: " + error.message, "danger", "books-table-alert");
    }
});

//==================================================================
//signout
document.getElementById("sign-out-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
    await signOutUser();
    window.location.href = "index.html"; 
    } catch (error) {
    alert("Error signing out: " + error.message, "danger", "books-table-alert");
    }
});



});



