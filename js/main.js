var imageValue;
var searchInput = document.getElementById('searchInput');
var currentIndex = -1;
var regex = {
   tel: /^(\+201|\+2001|00201|00201|01)/,
   msgName: /^[a-zA-Z]{1}[a-zA-Z ]{1,49}$/,
   msgPhoneNumber: /^(?:\+20|0|0020)1[0125][0-9]{8}$/,
   msgEmail:
      /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
   msgImage: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
};

// --- all Contacts Data ---
var allContacts = JSON.parse(localStorage.getItem('allContacts')) || [];
function updatedStorageData(action, data) {
   switch (action) {
      case 'addOrUpdate':
         if (currentIndex === -1) allContacts.push(data);
         else {
            allContacts.splice(currentIndex, 1, data);
            currentIndex = -1;
         }
         break;

      case 'delete':
         allContacts.splice(data, 1);
         break;

      default:
         console.error('An error occurred while saving data');
         break;
   }
   localStorage.setItem('allContacts', JSON.stringify(allContacts));
   imageValue = null;
}

// --- add & update & delete ---
function addUpdate(btnType) {
   if (!validateContactForm(btnType)) return;
   var contact = getContactValue();
   updatedStorageData('addOrUpdate', contact);
   clearForm();
   displayData();
   Swal.close();
   Swal.fire({
      title: btnType === 'add' ? 'Added!' : 'Updated!',
      text: btnType === 'update' ? 'Contact has been added successfully.' : 'Contact has been updated successfully.',
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
   });
}
function deleteContact(id) {
   var index = searchById(id);
   if (index === -1) return;

   Swal.fire({
      title: 'Delete Contact?',
      text: `Are you sure you want to delete ${allContacts[index].name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
   }).then((result) => {
      if (result.isConfirmed) {
         updatedStorageData('delete', index);
         displayData();

         Swal.fire({
            title: 'Deleted!',
            text: 'Contact has been deleted.',
            icon: 'success',
            showConfirmButton: false,

            timer: 1800,
         });
      }
   });
}
function setFavorite(id) {
   currentIndex = searchById(id);
   if (currentIndex === -1) return;

   var contact = allContacts[currentIndex];
   contact.quickAccess.favorite ? (contact.quickAccess.favorite = false) : (contact.quickAccess.favorite = true);

   updatedStorageData('addOrUpdate', contact);
   displayData();
}
function setEmergency(id) {
   currentIndex = searchById(id);
   if (currentIndex === -1) return;

   var contact = allContacts[currentIndex];
   contact.quickAccess.emergency ? (contact.quickAccess.emergency = false) : (contact.quickAccess.emergency = true);

   updatedStorageData('addOrUpdate', contact);
   displayData();
}

// --- form ---
function formInputs() {
   var formInputs = {
      name: document.getElementById('nameInput'),
      phoneNumber: document.getElementById('phoneNumberInput'),
      email: document.getElementById('emailInput'),
      address: document.getElementById('addressInput'),
      group: document.getElementById('groupInput'),
      notes: document.getElementById('notesInput'),
      quickAccess: document.getElementsByName('quickAccess'),
      image: document.getElementById('imageInput'),
   };
   return formInputs;
}
function displayForm(formTitle, btnType) {
   Swal.fire({
      title: formTitle,
      html: formContainer(btnType),

      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,

      customClass: {
         popup: 'form',
         container: 'form-container',
         title: 'form-title',
      },
   });
}
function clearForm() {
   var input = formInputs();
   input.name.value = '';
   input.phoneNumber.value = '';
   input.email.value = '';
   input.address.value = '';
   input.group.value = '';
   input.notes.value = '';
   clearQuickAccess();
   input.image.value = '';
   searchInput.value = '';
}
function onCancelContactForm() {
   clearForm();
   Swal.close();
}
function imageFormDisplay() {
   var imageInput = document.getElementById('imageInput').files[0];
   var imageDisplay = document.getElementById('imageDisplay');
   if (!validateInputField(imageInput, 'msgImage')) return;

   if (imageInput) {
      convertFileBase64(imageInput, function (base64) {
         imageDisplay.innerHTML = `<span class="overflow-hidden rounded-circle object-fit-cover w-100 h-100"><img  src="${base64}" alt="none" /></span>`;
         imageValue = base64;
      });
   } else {
      imageDisplay.innerHTML = '<i class="fa-solid fa-user"></i>';
   }
}
function convertFileBase64(file, callback) {
   if (!file) return;
   const reader = new FileReader();
   reader.onload = function () {
      callback(reader.result);
   };
   reader.readAsDataURL(file);
}
function formContainer(btnType) {
   return `<form class="form-input">
               <!-- validationAlert -->
               <div id="validationAlert" onclick="closeValidationAlert()" class="d-none position-fixed w-100 h-100 top-0 start-0 "></div>

               <!-- input ( Image ) -->
               <div class="mb-3 d-flex flex-column gap-3 align-items-center">
                  <div>
                     <div id="imageDisplay" class="w-96 h-96 mx-auto fs-30 rounded-circle linear-gradient-br-blue-400-blue-600 text-white d-flex align-items-center justify-content-center">
                        <i class="fa-solid fa-user"></i>
                     </div>
                     <p id="msgImage" class="mb-0 text-rose-500 mt-2 fs-14 d-none">Please upload a valid image (GIF, JPEG, PNG, TIFF, WEBP, BMP)</p>
                  </div>

                  <label class="fs-14 fw-6 m-0 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 px-3 bg-gray-100 text-gray-700">
                     <span class="text-gray-500">
                        <i class="fa-solid fa-camera"></i>
                     </span>
                     <span>Change Photo</span>
                     <input onchange="imageFormDisplay()" type="file" class="d-none" id="imageInput" />
                  </label>
               </div>

               <!-- input ( name ) -->
               <div class="mb-3">
                  <label for="nameInput" class="form-label mb-1 text-gray-700 fw-6">Full Name <span class="text-rose-500">*</span></label>
                  <input type="text" oninput="validateInputField(this,'msgName')" class="form-control p-3 rounded-4 bg-gray-50" id="nameInput" placeholder="Enter full name" />
                  <p id="msgName" class="mb-0 text-rose-500 mt-2 fs-14 d-none">Name should contain only letters and spaces (2-50 characters)</p>
               </div> 

               <!-- input ( phone number ) -->
               <div class="mb-3">
                  <label for="phoneNumberInput" class="form-label mb-1 text-gray-700 fw-6">phone number <span class="text-rose-500">*</span></label>
                  <input type="text" oninput="validateInputField(this,'msgPhoneNumber')" class="form-control bg-gray-50 p-3 rounded-4" id="phoneNumberInput" placeholder="e.g., 01012345678" />
                  <p id="msgPhoneNumber" class="mb-0 text-rose-500 mt-2 fs-14 d-none">Please enter a valid Egyptian phone number</p>
               </div>

               <!-- input ( Email Address ) -->
               <div class="mb-3">
                  <label for="emailInput" class="form-label mb-1 text-gray-700 fw-6">Email Address</label>
                  <input type="email" oninput="validateInputField(this,'msgEmail')" class="form-control bg-gray-50 p-3 rounded-4" id="emailInput" placeholder="name@example.com" />
                  <p id="msgEmail" class="mb-0 text-rose-500 mt-2 fs-14 d-none">Please enter a valid email address</p>
               </div>

               <!-- input ( Address ) -->
               <div class="mb-3">
                  <label for="addressInput" class="form-label mb-1 text-gray-700 fw-6">Address</label>
                  <input type="text" class="form-control bg-gray-50 p-3 rounded-4" id="addressInput" placeholder="Enter address" />
               </div>

               <!-- input ( Group ) -->
               <div class="mb-3">
                  <label for="groupInput" class="form-label mb-1 text-gray-700 fw-6">Group</label>
                  <select name="group" id="groupInput" class="form-control bg-gray-50 p-3 rounded-4">
                     <option value="" selected>Select a group</option>
                     <option>Family</option>
                     <option>Work</option>
                     <option>School</option>
                     <option>Other</option>
                  </select>
               </div>

               <!-- input ( Notes ) -->
               <div class="mb-3">
                  <label for="notesInput" class="form-label mb-1 text-gray-700 fw-6">Notes</label>
                  <textarea class="form-control bg-gray-50 p-3 rounded-4" id="notesInput" rows="3" placeholder="Add notes about this contact"></textarea>
               </div>

               <!-- input ( checkbox ) -->
               <div class="mb-3 py-3 d-flex align-items-center gap-3">
                  <div class="d-flex align-items-center gap-2">
                     <input type="checkbox" name="quickAccess" value="favorite" class="form-check w-20 h-20 rounded-4" id="favoriteInput" placeholder="Enter address" />
                     <label for="favoriteInput" class="form-label mb-1 text-gray-700 fw-6">
                        <span class="fs-14 text-amber-400 me-1"><i class="fa-solid fa-star"></i></span> Favorite
                     </label>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                     <input type="checkbox" name="quickAccess" value="emergency" class="form-check w-20 h-20 rounded-4" id="emergencyInput" placeholder="Enter address" />
                     <label for="emergencyInput" class="form-label mb-1 text-gray-700 fw-6">
                        <span class="fs-14 text-rose-500 me-1"><i class="fa-solid fa-heart-pulse"></i></span> Emergency
                     </label>
                  </div>
               </div>

               <!-- buttons -->
               <div class="container p-1">
                  <div class="row g-2">
                     <div class="col-12 col-sm-6">
                        <button onclick="onCancelContactForm()" type="button" class="btn cancel fw-6 w-100 bg-gray-100 text-gray-700">Cancel</button>
                     </div>
                     <div class="col-12 col-sm-6">
                        <button onclick="addUpdate('${btnType}')" type="button" class="btn save fw-6 w-100 d-flex align-items-center justify-content-center gap-1 text-white linear-gradient-r-violet-600-indigo-600">
                           <span class="fs-12 me-1"><i class="fa-solid fa-check"></i></span>Save Contact
                        </button>
                     </div>
                     
                  </div>
               </div>
            </form>`;
}

// --- Values ---
function getContactValue() {
   var input = formInputs();
   var contact = {
      id: generateId(),
      name: input.name.value.trim(),
      phoneNumber: input.phoneNumber.value.trim(),
      email: input.email.value.trim(),
      address: input.address.value.trim(),
      group: input.group.value.trim(),
      notes: input.notes.value.trim(),
      quickAccess: getQuickAccessValue(),
      image: imageValue,
   };
   return contact;
}
function setContactValue(id) {
   currentIndex = searchById(id);
   if (currentIndex === -1) return;
   displayForm('Edit Contact', 'update');
   var input = formInputs();
   input.name.value = allContacts[currentIndex].name;
   input.phoneNumber.value = allContacts[currentIndex].phoneNumber;
   input.email.value = allContacts[currentIndex].email;
   input.address.value = allContacts[currentIndex].address;
   input.group.value = allContacts[currentIndex].group;
   input.notes.value = allContacts[currentIndex].notes;
   setQuickAccessValue(currentIndex);
   if (allContacts[currentIndex].image)
      document.getElementById(
         'imageDisplay'
      ).innerHTML = `<span class="overflow-hidden rounded-circle object-fit-cover w-100 h-100"><img  src="${allContacts[currentIndex].image}" alt="none" /></span>`;
}
function clearQuickAccess() {
   var input = formInputs();
   for (var i = 0; i < input.quickAccess.length; i++) {
      input.quickAccess[i].checked = false;
   }
}
function getQuickAccessValue() {
   var input = formInputs();
   var quickAccessValue = {
      favorite: false,
      emergency: false,
   };

   for (var i = 0; i < input.quickAccess.length; i++) {
      if (input.quickAccess[i].checked) quickAccessValue[input.quickAccess[i].value] = true;
   }
   return quickAccessValue;
}
function setQuickAccessValue(index) {
   var input = formInputs();
   for (var i = 0; i < input.quickAccess.length; i++) {
      // (      {}           .quickAccess . (favorite || favorite) ==>  true || false)
      if (allContacts[index].quickAccess[input.quickAccess[i].value]) input.quickAccess[i].checked = true;
   }
}

// --- search ---
function searchById(searchId) {
   for (var i = 0; i < allContacts.length; i++) {
      if (searchId === allContacts[i].id) {
         return i;
      }
   }
   return -1;
}
function searchForDuplicatePhoneNumbers(number) {
   for (var i = 0; i < allContacts.length; i++) {
      if (allContacts[i].phoneNumber.includes(number.trim())) return i;
   }
   return -1;
}

// ---  ---
function generateId() {
   return `${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 1000)}`;
}
function avatarInitialsColor(index) {
   var mod = (allContacts[index].name.length + 1) % 9;
   switch (mod) {
      case 2:
         return `linear-gradient-br-emerald-500-teal-600`;
      case 3:
         return `linear-gradient-br-rose-500-pink-600`;
      case 4:
         return `linear-gradient-br-amber-500-orange-600`;
      case 5:
         return `linear-gradient-br-cyan-500-blue-600`;
      case 6:
         return `linear-gradient-br-indigo-500-violet-600`;
      case 7:
         return `linear-gradient-br-fuchsia-500-pink-600`;
      case 8:
         return `linear-gradient-br-blue-500-blue-600`;
      case 0:
         return `linear-gradient-br-violet-500-purple-600`;
      default:
         return `linear-gradient-br-amber-500-orange-600`;
   }
}
function getFirstCharsOfName(name) {
   var fulName = name;
   if (!fulName) return '';
   var chars = '';
   fulName = fulName.split(' ');
   chars = fulName.at(0).at(0);
   if (fulName.length === 1) return chars;
   else chars += fulName.at(fulName.length - 1).at(0);
   return chars;
}

// --- Validation ---
function validateInputField(element, msgId) {
   var msg = document.getElementById(msgId);

   if (element && msgId === 'msgImage' && regex[msgId].test(element.name)) {
      msg.classList.add('d-none');
      return true;
   } else if (msgId !== 'msgImage' && regex[msgId].test(element.value)) {
      msg.classList.add('d-none');
      return true;
   } else {
      msg.classList.remove('d-none');
      return false;
   }
}
function validateContactForm(addUpdate) {
   var index = -1;
   if (addUpdate !== 'update') index = searchForDuplicatePhoneNumbers(formInputs().phoneNumber.value);

   switch (true) {
      case !validateInputField(formInputs().name, 'msgName') && formInputs().name.value !== '':
         showValidationAlert('Invalid Name', 'Name should contain only letters and spaces (2-50 characters)');
         return false;

      case formInputs().name.value === '':
         showValidationAlert('Missing Name', 'Please enter a name for the contact!');
         validateInputField(document.getElementById('nameInput'), 'msgName');
         return false;

      case !validateInputField(formInputs().phoneNumber, 'msgPhoneNumber') && formInputs().phoneNumber.value !== '':
         showValidationAlert('Invalid Phone', 'Please enter a valid Egyptian phone number (e.g., 01012345678 or +201012345678)');
         return false;

      case formInputs().phoneNumber.value === '':
         showValidationAlert('Missing Phone', 'Please enter a phone number!');
         return false;

      case index !== -1:
         showValidationAlert('Duplicate Phone Number', `A contact with this phone number already exists: ${allContacts[index].name}`);
         return false;
   }
   return true;
}
function showValidationAlert(title, msg) {
   var element = document.getElementById('validationAlert');
   element.innerHTML = validationAlertContainer(title, msg);
   element.classList.remove('d-none');
}
function closeValidationAlert() {
   var element = document.getElementById('validationAlert');
   element.classList.add('d-none');
}
function validationAlertContainer(title, msg) {
   return `
         <div class="validation-alert position-absolute top-50 start-50 translate-middle rounded-4 w-100 bg-white shadow-lg border border-2 border-gray-200">
            <div class="icon">
               <div class="x-mark">
                  <div class="x-mark-left"></div>
                  <div class="x-mark-right"></div>
               </div>
            </div>

            <h2 id="alertTitle" class="mt-4 text-center fs-30 fw-6 text-gray-700">${title}</h2>
            <div id="alertText" class="lead fs-16 fw-5 text-center mb-3">${msg}</div>

            <div class="text-center">
               <button type="button" onclick="closeValidationAlert()" class="alert-btn btn py-2 px-3 text-white fw5">OK</button>
            </div>
         </div>`;
}

// --- contactHub ---
function contactHub() {
   var allContactHub = {
      numberOfAllContacts: {
         contacts: document.getElementById('numContact'),
         favoritesContact: document.getElementById('numFavoritesContact'),
         emergencyContact: document.getElementById('numEmergencyContact'),
      },
      contactsSubTitle: document.getElementById('contactsSubTitle'),
      contactsList: document.getElementById('contactsList'),
      favoritesList: document.getElementById('favoritesList'),
      emergencyList: document.getElementById('emergencyList'),
   };
   return allContactHub;
}
function htmlContainers() {
   function numContactContainer() {
      return allContacts.length;
   }
   function numFavoritesContactContainer() {
      var counter = 0;
      for (var i = 0; i < allContacts.length; i++) {
         if (allContacts[i].quickAccess.favorite) counter++;
      }
      return counter;
   }
   function numEmergencyContactContainer() {
      var counter = 0;
      for (var i = 0; i < allContacts.length; i++) {
         if (allContacts[i].quickAccess.emergency) counter++;
      }
      return counter;
   }
   function contactsSubTitleContainer() {
      return `Manage and organize your ${allContacts.length} contacts`;
   }
   function contactsListContainer(index) {
      var contact = allContacts[index];
      return `
      <div class="col-12 col-md-6 ">
         <div class="card border shadow-md border-2 rounded-4 border-gray-100 h-100">
            <div class="card-body">
               <div class="d-flex align-items-center gap-3">
                  <div
                     class="${avatarInitialsColor(index)} flex-shrink-0 w-56 h-56 rounded-4 d-flex align-items-center justify-content-center position-relative"
                  >
                  ${
                     contact.image
                        ? `<span class="overflow-hidden rounded-4 object-fit-cover w-100 h-100"><img  src="${contact.image}" alt="${contact.name}" /></span>`
                        : `<span class="fs-18 fw-6 text-uppercase text-white">${getFirstCharsOfName(contact.name)}</span>`
                  }
                     ${
                        contact.quickAccess.favorite
                           ? ` <span
                        class="w-24 h-24 fs-8 bg-amber-400 text-white position-absolute end-0 top-0 translate-75-top-end rounded-circle border border-3 border-white d-flex align-items-center justify-content-center"
                     >
                        <i class="fa-solid fa-star"></i>
                     </span>`
                           : ''
                     }
                     ${
                        contact.quickAccess.emergency
                           ? `  <span
                        class="w-24 h-24 fs-8 bg-rose-500 text-white position-absolute end-0 bottom-0 translate-75-bottom-end rounded-circle border border-3 border-white d-flex align-items-center justify-content-center"
                     >
                        <i class="fa-solid fa-heart-pulse"></i>
                     </span>`
                           : ''
                     }
                  </div>
   
                  <div class="info">
                     <h2 class="text-gray-900 fw-6 fs-16 m-0">${contact.name}</h2>
                     <p class="d-flex align-items-center gap-2 m-0 mt-1">
                        <span class="fs-8 w-24 h-24 rounded-2 d-flex align-items-center justify-content-center bg bg-blue-100 text-blue-600">
                           <i class="fa-solid fa-phone"></i>
                        </span>
                        <span class="fs-14 text-gray-500">${contact.phoneNumber}</span>
                     </p>
                  </div>
               </div>
   
               ${
                  contact.email || contact.address
                     ? `
                  <div class="mt-2 pt-1">
                  ${
                     contact.email
                        ? `
                     <p class="m-0 d-flex align-items-center gap-2">
                        <span class="fs-12 w-28 h-28 bg-violet-100 text-violet-600 rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0">
                           <i class="fa-solid fa-envelope"></i>
                        </span>
                        <span class="fs-14 text-gray-600">${contact.email}</span>
                     </p>`
                        : ''
                  }
                  ${
                     contact.address
                        ? `
   
                     <p class="m-0 mt-2 d-flex align-items-center gap-2">
                        <span class="fs-12 w-28 h-28 bg-emerald-100 text-emerald-600 rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0">
                           <i class="fa-solid fa-location-dot"></i>
                        </span>
                        <span class="fs-14 text-gray-600">${contact.address}</span>
                     </p>`
                        : ''
                  }
               </div>`
                     : ''
               }
   
               <div class="fs-12 fw-5 mt-2 pt-1 d-flex align-items-center gap-2">
               ${
                  contact.group
                     ? `<span class="py-1 px-2 rounded-3
                     ${
                        contact.group.toLocaleLowerCase() === 'family'.toLocaleLowerCase()
                           ? 'bg-blue-100 text-blue-700'
                           : contact.group.toLocaleLowerCase() === 'friends'.toLocaleLowerCase()
                           ? 'bg-green-100 text-green-700'
                           : contact.group.toLocaleLowerCase() === 'work'.toLocaleLowerCase()
                           ? 'bg-purple-100 text-purple-700'
                           : contact.group.toLocaleLowerCase() === 'school.toLocaleLowerCase()'
                           ? 'bg-amber-100  text-amber-700'
                           : 'bg-gray-100 text-gray-700'
                     }
                  ">${contact.group}</span>`
                     : ''
               }
                  ${
                     contact.quickAccess.emergency
                        ? `<div class="py-1 px-2 rounded-3 bg-rose-50 text-rose-600 d-flex align-items-center gap-1">
                              <span class="d-inline-flex align-items-center justify-content-center"> <i class="fa-solid fa-heart-pulse"></i></span>
                              <span>Emergency</span>
                           </div>`
                        : ''
                  }
               </div>
            </div>
   
            <div class="card-footer bg-gray-50 bg-opacity-80 border-gray-100 d-flex align-items-center justify-content-between">
               <!-- get-in-touch -->
               <div class="d-flex align-items-center gap-2">
                  <a
                     href="tel:+${contact.phoneNumber?.replace(/^(\+201|\+2001|00201|002001|01)/, '201') || ''}"
                     class="text-decoration-none border border-1 border-gray-100 rounded-3 bg-emerald-50 text-emerald-600 w-36 h-36 d-flex align-items-center justify-content-center"
                  >
                     <i class="fa-solid fa-phone"></i>
                  </a>
   
               ${
                  contact.email
                     ? `<a
                     href="mailto:${contact.email}"
                     class="text-decoration-none border border-1 border-gray-100 rounded-3 bg-violet-50 text-violet-600 w-36 h-36 d-flex align-items-center justify-content-center"
                  >
                     <i class="fa-solid fa-envelope"></i>
                  </a>`
                     : ''
               }
               </div>
   
               <!-- Buttons -->
               <div class="d-flex align-items-center gap-2">
                  <button  onclick="setFavorite('${contact.id}')" class="btn p-0 w-36 h-36 d-flex align-items-center justify-content-center
                     ${contact.quickAccess.favorite ? ' bg-amber-50  text-amber-400' : ' bg-gray-50  text-gray-400'}">
                     ${contact.quickAccess.favorite ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'}                  
                  </button>
                  
                  <button onclick="setEmergency('${contact.id}')" class="btn p-0 w-36 h-36 d-flex align-items-center  justify-content-center
                     ${contact.quickAccess.emergency ? ' bg-rose-50 text-rose-500' : ' text-gray-400 bg-gray-50'}">
                     ${contact.quickAccess.emergency ? '<i class="fa-solid fa-heart-pulse"></i>' : '<i class="fa-regular fa-heart"></i>'}   
                  </button>

                  <button onclick = "setContactValue('${contact.id}')" class="btn p-0 w-36 h-36 bg-gray-50 text-gray-500 d-flex align-items-center justify-content-center">
                     <i class="fa-solid fa-pen"></i>
                  </button>
   
                  <button onclick = "deleteContact('${contact.id}')" class="btn p-0 w-36 h-36 bg-gray-50 text-gray-500 d-flex align-items-center justify-content-center">
                     <i class="fa-solid fa-trash"></i>
                  </button>
               </div>
            </div>
         </div>
      </div>
      `;
   }
   function favoritesListContainer(index) {
      var contact = allContacts[index];
      return `
         <div class="col-12 col-md-6 col-xl-12">
            <a href="tel:+${contact.phoneNumber?.replace(regex.tel, '201') || ''}"
               class="text-decoration-none border border-1 border-gray-100 rounded-3 p-2 d-flex align-items-center justify-content-between">
            
               <div class="d-flex align-items-center gap-1 ">

                  <div class="${avatarInitialsColor(index)} w-40 h-40 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                     ${
                        contact.image
                           ? `<span class="overflow-hidden rounded-3 object-fit-cover w-100 h-100"><img  src="${contact.image}" alt="${contact.name}"</span> `
                           : `<span class="fs-14 fw-6 text-uppercase text-white">${getFirstCharsOfName(contact.name)}</span>`
                     }
                  </div>

                  <div class="info me-3">
                     <h3 class="m-0 fs-12 text-gray-900 fw-7">${contact.name}</h3>
                     <p class="m-0 fs-10 text-gray-500">${contact.phoneNumber}</p>
                  </div>
               </div>

               <div
                  class="border border-1 border-gray-100 rounded-3 bg-emerald-50 text-emerald-600 fs-10 w-24 h-24 d-flex align-items-center justify-content-center flex-shrink-0"
               >
                  <i class="fa-solid fa-phone"></i>
               </div>
            </a>
         </div>
      `;
   }
   function emergencyListContainer(index) {
      var contact = allContacts[index];
      return `
         <div class="col-12 col-md-6 col-xl-12">
            <a href="tel:+${contact.phoneNumber?.replace(regex.tel, '201') || ''}" 
               class="text-decoration-none border border-1 border-gray-100 rounded-3 p-2 d-flex align-items-center justify-content-between">
               <div class="d-flex align-items-center gap-1">
                  <div class="${avatarInitialsColor(index)} w-40 h-40  rounded-3 d-flex align-items-center justify-content-center flex-shrink-0">
                     ${
                        contact.image
                           ? `<span class="overflow-hidden rounded-3 object-fit-cover w-100 h-100"><img  src="${contact.image}" alt="${contact.name}"</span> `
                           : `<span class="fs-14 fw-6 text-uppercase text-white">${getFirstCharsOfName(contact.name)}</span>`
                     }
                  </div>
                  <div class="info me-3">
                     <h3 class="m-0 fs-12 text-gray-900 fw-7">${contact.name}</h3>
                     <p class="m-0 fs-10 text-gray-500">${contact.phoneNumber}</p>
                  </div>
               </div>
               <div
                  class="border border-1 border-gray-100 rounded-3 bg-rose-100 text-rose-600 fs-10 w-24 h-24 d-flex align-items-center justify-content-center flex-shrink-0"
               >
                  <i class="fa-solid fa-phone"></i>
               </div>
            </a>
         </div>
      `;
   }
   function noContacts() {
      return `
      <div class="px-80 text-center">
         <div class="mx-auto mb-3 w-80 h-80 bg-gray-100 text-gray-300 fs-24 w-44 h-44 rounded-3 d-flex align-items-center justify-content-center">
            <i class="fa-solid fa-address-book"></i>
         </div>
         <p class="m-0 text-gray-500">No contacts found</p>
         <p class="mt-1 fs-14 text-gray-400">Click "Add Contact" to get started</p>
      </div>
   `;
   }
   return {
      numContactContainer,
      numFavoritesContactContainer,
      numEmergencyContactContainer,
      contactsSubTitleContainer,
      contactsListContainer,
      favoritesListContainer,
      emergencyListContainer,
      noContacts,
   };
}
function displayData() {
   console.log(allContacts);
   var cartonaFavoritesList = '';
   var cartonaEmergencyList = '';
   var cartonaContactsList = '';
   var container = htmlContainers();
   var setContactHub = contactHub();

   if (!allContacts.length) cartonaContactsList = container.noContacts();

   for (var i = 0; i < allContacts.length; i++) {
      if (
         allContacts[i].name.toLocaleLowerCase().includes(searchInput.value.trim().toLocaleLowerCase()) ||
         allContacts[i].email.toLocaleLowerCase().includes(searchInput.value.trim().toLocaleLowerCase()) ||
         allContacts[i].phoneNumber.includes(searchInput.value.trim())
      )
         cartonaContactsList += container.contactsListContainer(i);
      if (allContacts[i].quickAccess.favorite) cartonaFavoritesList += container.favoritesListContainer(i);
      if (allContacts[i].quickAccess.emergency) cartonaEmergencyList += container.emergencyListContainer(i);
   }

   setContactHub.contactsList.innerHTML = cartonaContactsList;
   setContactHub.favoritesList.innerHTML = cartonaFavoritesList;
   setContactHub.emergencyList.innerHTML = cartonaEmergencyList;
   setContactHub.contactsSubTitle.innerHTML = container.contactsSubTitleContainer();
   setContactHub.numberOfAllContacts.contacts.innerHTML = container.numContactContainer();
   setContactHub.numberOfAllContacts.favoritesContact.innerHTML = container.numFavoritesContactContainer();
   setContactHub.numberOfAllContacts.emergencyContact.innerHTML = container.numEmergencyContactContainer();
}

// --- when start app ---
displayData();
