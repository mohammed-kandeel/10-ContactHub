# 📒 ContactHub — Smart Contact Manager

A full-featured contact management web app with complete CRUD operations, localStorage persistence, real-time search, and SweetAlert2 modals. The modern equivalent of the old home address book — but way better.

🌐 **Live Demo:** [mohammed-kandeel.github.io/10-ContactHub](https://mohammed-kandeel.github.io/10-ContactHub/)

---

## 🚀 Features

### 📋 CRUD Operations
- ➕ **Add Contact** — Full form with name, phone, email, address, group, notes, photo, and quick access flags
- ✏️ **Edit Contact** — Pre-filled form with all existing data, confirm before saving
- 🗑️ **Delete Contact** — SweetAlert2 confirmation dialog before deletion
- 🔍 **Search** — Real-time filtering by name, phone number, or email

### ⭐ Quick Access
- **Favorites** — Star/unstar any contact; shown in the sidebar for quick calling
- **Emergency** — Mark emergency contacts; displayed separately with red badge

### 📞 Action Buttons
- **Call button** → `href="tel:+..."` — opens the phone app directly
- **Email button** → `href="mailto:..."` — opens the email app directly

### 💾 Data Persistence
- All contacts saved to **localStorage** — data survives page reloads and browser restarts
- Images stored as **Base64** strings via FileReader API

### ✅ Validation
- Name: letters + spaces only, 2–50 characters
- Phone: valid Egyptian numbers (`01x`, `+201x`, `00201x`) validated with **Regex**
- Email: full RFC-5322 compliant regex pattern
- Image: valid image extension check (gif, jpg, png, webp, bmp, tiff)
- Duplicate phone number detection before adding
- Custom animated validation alert (X-mark icon with CSS keyframe animation)

### 🎨 UX Details
- **Dynamic avatar initials** — color-coded gradient based on name length (9 color variations)
- **Photo upload** — converted to Base64, displayed as circular avatar
- **SweetAlert2** — for add/edit forms, success toasts, and delete confirmations
- **Sticky form title** + scrollable modal content
- **Text overflow ellipsis** for long names

---

## 🛠️ Technologies Used

- **HTML5** — Semantic structure
- **CSS3** — CSS Variables (`oklch` color space), transitions, `@keyframes` animations, `backdrop-filter`
- **Bootstrap 5** — Grid, responsive layout, utility classes
- **Vanilla JavaScript** — Full CRUD, DOM manipulation, Regex, localStorage, FileReader API
- **SweetAlert2** — Modal forms, success toasts, confirmation dialogs
- **Font Awesome** — Icons
- **Google Fonts** — Inter font family

---

## 🧠 JavaScript Concepts Used

### localStorage CRUD
```javascript
var allContacts = JSON.parse(localStorage.getItem('allContacts')) || [];

function updatedStorageData(action, data) {
  switch (action) {
    case 'addOrUpdate':
      if (currentIndex === -1) allContacts.push(data);
      else allContacts.splice(currentIndex, 1, data);
      break;
    case 'delete':
      allContacts.splice(data, 1);
      break;
  }
  localStorage.setItem('allContacts', JSON.stringify(allContacts));
}
```

### Regex Validation
```javascript
var regex = {
  msgName: /^[a-zA-Z]{1}[a-zA-Z ]{1,49}$/,
  msgPhoneNumber: /^(?:\+20|0|0020)1[0125][0-9]{8}$/,
  msgEmail: /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+...)@.../,
  msgImage: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
};
```

### Base64 Image Conversion
```javascript
function convertFileBase64(file, callback) {
  const reader = new FileReader();
  reader.onload = function () { callback(reader.result); };
  reader.readAsDataURL(file);
}
```

### Dynamic Avatar Color
```javascript
function avatarInitialsColor(index) {
  var mod = (allContacts[index].name.length + 1) % 9;
  // Returns one of 9 gradient CSS classes based on name length
}
```

### Phone Number Normalization for `tel:` links
```javascript
contact.phoneNumber?.replace(/^(\+201|\+2001|00201|002001|01)/, '201')
```

---

## 📁 Project Structure

```
ContactHub/
│
├── index.html
├── css/
│   ├── styles.css          # Component styles + animations
│   ├── utilities.css       # Custom utility classes (oklch colors, sizing, gradients)
│   ├── bootstrap.min.css
│   ├── sweetalert2.min.css
│   └── all.min.css         # Font Awesome
├── js/
│   ├── main.js             # All CRUD logic + DOM rendering
│   ├── bootstrap.bundle.min.js
│   └── sweetalert2.all.min.js
├── images/
│   ├── avatar-2.webp
│   └── favicon.png
│
└── README.md
```

---

## 🖥️ Layout Overview

| Section | Description |
|---------|-------------|
| Navbar | Fixed, glassmorphism (`backdrop-filter: blur`), Add Contact button |
| Stats Row | Total / Favorites / Emergency counters with gradient icons |
| Main (8/12) | Search bar + contacts grid (2 columns on md+) |
| Sidebar (4/12) | Favorites list + Emergency list (sticky on xl+) |

---

## ⚙️ CSS Concepts Used

| Concept | Usage |
|---------|-------|
| `oklch` color space | All color variables use modern oklch format for perceptual uniformity |
| CSS Variables | Complete design token system for colors, spacing, typography |
| `backdrop-filter: blur` | Glassmorphism navbar effect |
| `@keyframes` | Validation alert slide-in + X-mark icon animation |
| CSS nesting | Component-scoped styles (`nav { .add { ... } }`) |
| `position: sticky` | Form title stays visible while scrolling the modal |
| CSS transitions | Hover effects on all cards, buttons, and links |
| `text-overflow: ellipsis` | Prevents long names from breaking card layout |
| Bootstrap 5 | Grid system, responsive utilities |
| Custom utility classes | Tailwind-inspired `text-*`, `bg-*`, `linear-gradient-*` classes using `oklch` |

---

## ▶️ How to Run

No setup needed — open directly in any browser:

```bash
open index.html
```

---

## 🔮 Possible Future Improvements

- [ ] Export contacts to CSV or vCard
- [ ] Import contacts from a file
- [ ] Contact groups filtering
- [ ] Sort contacts alphabetically
- [ ] Dark mode support

---

## 👤 Author

**Mohammed Kandeel**  
🔗 [10-ContactHub](https://github.com/mohammed-kandeel/10-ContactHub)  
🌐 [Live Demo](https://mohammed-kandeel.github.io/10-ContactHub/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
