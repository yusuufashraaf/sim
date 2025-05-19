async function increaseCount(id) {
  const cartRef = doc(db, "cart", id);

  try {
    const cartDoc = await getDoc(cartRef);
    if (!cartDoc.exists()) return;

    const cartData = cartDoc.data();

    const booksRef = collection(db, "books");
    const q = query(booksRef, where("bookId", "==", cartData.bookId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const bookDoc = querySnapshot.docs[0];
      const bookRef = bookDoc.ref;
      const bookData = bookDoc.data();

      console.log("Before increase - quantity:", cartData.quantity, "stock:", bookData.stock);

      // Check if you can add 1 more without exceeding stock
      if (cartData.quantity + 1 <= bookData.stock) {
        await updateDoc(cartRef, {
          quantity: cartData.quantity + 1,
        });

        // Decrease stock only if your app logic requires it here.
        // If you want to keep stock consistent with cart quantity, uncomment the line below.
        // await updateDoc(bookRef, { stock: bookData.stock - 1 });

        console.log("Quantity increased successfully");
      } else {
        alert("No more books available");
      }
    } else {
      console.error("Book not found");
    }
  } catch (error) {
    console.error("Error increasing quantity:", error);
  }
}
