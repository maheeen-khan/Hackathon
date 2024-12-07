import {
    app, auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, signInWithPopup, provider, GoogleAuthProvider, deleteUser
}
    from './firebase.js'

    import {
        db,
        getFirestore,
        collection,
        addDoc,
        getDocs,
        Timestamp,
        query,
        orderBy,
        limit,
        doc, deleteDoc, updateDoc
    } from "./firebase.js";


if (document.getElementById('gotoLogin')) {


    document.getElementById('gotoLogin').addEventListener('click', () => {
        window.location.href = './login.html'
    })
}


//Auth//
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user);
    if (user) {

        // User is signed in
        const uid = user.uid;
        console.log("user exists", user);
        console.log("user id ", uid);

        localStorage.setItem('user id', user.uid)
        localStorage.setItem('email', user.email);
        localStorage.setItem('name', user.
            displayName)

    } else {
        // User is signed out
        console.log("user does not exist", user);
    }
});
let user_id = localStorage.getItem('user id');
let user_email = localStorage.getItem('email');
let user_name = localStorage.getItem('name');

document.addEventListener("DOMContentLoaded", () => {
    //////Register///////////
    let registerBtn = document.getElementById('register');

    if (registerBtn) {
        try {
            let registerFunc = () => {
                let email = document.getElementById('email');
                let password = document.getElementById('password');

                createUserWithEmailAndPassword(auth, email.value, password.value)
                    .then((userCredential) => {
                        // Signed up
                        const user = userCredential.user;
                        console.log("User registered");
                        // alert("User registered");

                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Registration Successful!",
                            text: 'Thank you for registering. Welcome aboard!',
                            showConfirmButton: false,
                            timer: 2000
                        });



                        setTimeout(() => {
                            window.location.href = "./login.html";
                        }, 2000);


                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log("User registration failed");
                        console.log(errorMessage);
                    });
            };

            registerBtn.addEventListener('click', registerFunc);
        } catch (e) {
            console.error("Register button not found in the DOM.", e);
        }
    }
});


/////google authentication


let googleBtn = document.getElementById('google');

document.addEventListener("DOMContentLoaded", () => {

    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            signInWithPopup(auth, provider)
                .then((result) => {

                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const token = credential.accessToken;

                    const user = result.user;
                    console.log(token);
                    console.log(user);




                    var newuser = user.email.split('@')[0];  // Get part before '@'
                    var nameOnly = newuser.replace(/[0-9]/g, ""); // Remove numbers from the name part

                    // Store name in localStorage
                    localStorage.setItem('name', nameOnly);

                    // localStorage.setItem('email', loginEmail.value)

                    setTimeout(() => {
                        window.location.href = "./index.html";
                        
                        localStorage.setItem('showAddPostButton', true); 
                    }, 2000);


                }).catch((error) => {


                    const errorMessage = error.message;
                    console.log(errorMessage);

                    const credential = GoogleAuthProvider.credentialFromError(error);

                });

        })
    }
});

///////Login/////////////
let loginBtn = document.getElementById('login');

if (loginBtn) {
    try {

        loginBtn.addEventListener("click", () => {
            let loginEmail = document.getElementById('login-email');
            let loginPassword = document.getElementById('login-password');

            signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    // alert("Login Successfully!");

                    Swal.fire({
                        title: "Login Successfully!",
                        showClass: {
                            popup: `
                          animate__animated
                          animate__fadeInUp
                          animate__faster
                        `
                        },
                        hideClass: {
                            popup: `
                          animate__animated
                          animate__fadeOutDown
                          animate__faster
                        `
                        }
                    });

                    var newuser = user.email.split('@')[0];  // Get part before '@'
                    var nameOnly = newuser.replace(/[0-9]/g, ""); // Remove numbers from the name part

                    // Store name in localStorage
                    localStorage.setItem('name', nameOnly);

                    localStorage.setItem('email', loginEmail.value)

                    setTimeout(() => {
                        window.location.href = "./index.html";
                        
                        localStorage.setItem('showAddPostButton', true); 
                    }, 2000);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorMessage);
                    // alert("Invalid Information!")
                });
        });
    } catch (e) {
        console.error("Login button not found in the DOM.", e);
    }
}

// document.getElementById('addPost').addEventListener('click',()=>{

// })
var myTitle;
var myContent;
var myCategory;

document.addEventListener("DOMContentLoaded", () => {
    let addPostBtn = document.getElementById("addPost");

    if (addPostBtn) {
        addPostBtn.addEventListener("click", () => {
            Swal.fire({
                title: 'Create a New Blog Post',
                html: `
                    <input type="text" id="blogTitle" class="swal2-input" placeholder="Enter Blog Title">
                    <textarea id="blogContent" class="swal2-textarea" placeholder="Write your blog here..."></textarea>
                    <select id="blogCategory" class="swal2-select">
                        <option value="" disabled selected>Select Category</option>
                        <option value="Technology">Design Thinking</option>
                        <option value="Lifestyle">Technology</option>
                        <option value="Education">Web3</option>
                        <option value="Health">Programming</option>
                        <option value="Education">AI</option>
                    </select>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Submit',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const title = document.getElementById("blogTitle").value;
                    const content = document.getElementById("blogContent").value;
                    const category = document.getElementById("blogCategory").value;

                    if (!title || !content || !category) {
                        Swal.showValidationMessage("Please fill all fields!");
                        return false;
                    }

                    return { title, content, category };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { title, content, category } = result.value;

                    // Store in variables
                    console.log("Title:", title);
                    console.log("Content:", content);
                    console.log("Category:", category);

                    myTitle = title;
                    myContent = content;
                    myCategory = category;

                    addmyDoc();
                    readData();

                    // Optionally, do something with the data
                    Swal.fire({
                        icon: 'success',
                        title: 'Blog Post Created!',
                        text: `Your blog titled "${title}" in the category "${category}" has been saved!`,
                        timer: 3000,
                        showConfirmButton: false
                    });
                }
            });
        });
    }
});

async function addmyDoc() {
    // Add a new document with a generated id.

    try {
        const docRef = await addDoc(collection(db, "users",), {

            title: myTitle,
            content: myContent,
            category:myCategory,

        });
        // title = "";
        // selectedValue= "";
        alert("Document written with ID: ", docRef.id);
    }

    catch (e) {
        console.log(e);

    }
}

async function readData() {
    let arr = [];
    displayPosts.innerHTML = ""; // Clear posts before rendering new ones

    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        arr.push({ ...doc.data(), docId: doc.id });
        console.log(doc.id, " => ", doc.data());
    });

    arr.map((item, index) => {
        displayPosts.innerHTML += `
            <div class="card p-3">
                <div class="card-body">
                  <h3 class="card-title">${item.title}</h3>
                  
                  <p class="card-text p-2">${item.content}</p>
                 <button type="button" class="btn btn-outline-secondary btn-sm catBtn">${item.category}</button>
                 <span id="guest" class="mt-3 ms-2">By ${localStorage.getItem('name')}</span> <br>
                  <button class="dltBtn btn btn-danger mt-3" data-id="${item.docId}">Delete</button>
                  <button class="edtBtn btn btn-warning  mt-3" data-id="${item.docId}">Edit</button>
                </div>
            </div>`;
    });

    // Attach event listeners to the dynamically created delete buttons
    document.querySelectorAll('.dltBtn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const docId = e.target.getAttribute("data-id"); // Get document ID from button's data-id attribute
            console.log("Deleting document with ID:", docId);
            try {
                await deleteDoc(doc(db, "users", docId)); // Delete the document
                console.log(`Document ${docId} deleted successfully.`);
                readData(); // Refresh the displayed data
            } catch (err) {
                console.error("Error deleting document:", err);
            }
        });
    });

    // Attach event listeners to the dynamically created edit buttons
    document.querySelectorAll('.edtBtn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const docId = e.target.getAttribute("data-id");
            const item = arr.find((item) => item.docId === docId); // Find the correct post based on docId

            // Show SweetAlert to confirm edit
            Swal.fire({
                title: 'Edit Blog Post',
                html: `
                    <input type="text" id="editTitle" value="${item.title}" class="swal2-input" placeholder="Enter Blog Title">
                    <textarea id="editContent" class="swal2-textarea" placeholder="Write your blog here...">${item.content}</textarea>
                    <select id="editCategory" class="swal2-select">
                        <option value="Design Thinking" ${item.category === 'Design Thinking' ? 'selected' : ''}>Design Thinking</option>
                        <option value="Technology" ${item.category === 'Technology' ? 'selected' : ''}>Technology</option>
                        <option value="Web3" ${item.category === 'Web3' ? 'selected' : ''}>Web3</option>
                        <option value="Programming" ${item.category === 'Programming' ? 'selected' : ''}>Programming</option>
                        <option value="AI" ${item.category === 'AI' ? 'selected' : ''}>AI</option>
                    </select>`,
                showCancelButton: true,
                confirmButtonText: 'Save',
                cancelButtonText: 'Cancel',
                preConfirm: () => {
                    const updatedTitle = document.getElementById('editTitle').value;
                    const updatedContent = document.getElementById('editContent').value;
                    const updatedCategory = document.getElementById('editCategory').value;

                    // Return updated data to be saved
                    return { updatedTitle, updatedContent, updatedCategory };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const { updatedTitle, updatedContent, updatedCategory } = result.value;

                    // Update document in Firestore
                    try {
                        updateDoc(doc(db, "users", docId), {
                            title: updatedTitle,
                            content: updatedContent,
                            category: updatedCategory
                        }).then(() => {
                            Swal.fire('Saved!', 'Your changes have been saved.', 'success');
                            readData(); // Refresh the displayed data
                        });
                    } catch (err) {
                        console.error('Error during edit:', err);
                    }
                }
            }).catch((err) => {
                console.error('Error during SweetAlert edit:', err);
            });
        });
    });
}


readData()