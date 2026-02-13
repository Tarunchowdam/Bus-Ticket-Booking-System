# Bus Ticket Booking & Boarding Management System

## Project Overview

The Bus Ticket Booking and Boarding Management System is a React-based web application designed to help bus conductors manage daily passenger bookings and optimize the boarding process.

The system provides:

- Interactive seat booking (2×2 layout – 60 seats)
- Booking creation, editing, and cancellation
- Mobile number–based booking validation
- Real-time boarding status tracking
- Boarding statistics dashboard
- Natural vs Optimal boarding time comparison
- Back-to-front boarding optimization algorithm
- Fully responsive and accessible UI

All data is stored in the browser using Local Storage for fast and simple daily operations.




## 🛠️ Tech Stack

### Frontend
- React.js (Functional Components + Hooks)
- React Context API (State Management)
- CSS 

### Data Storage
- Browser Local Storage

### Build Tool
- Create React App

---

##  Project Structure
---
bus-booking-system/
│
├── src/
│ ├── components/
│ │ ├── BookingForm/
│ │ ├── BookingList/
│ │ ├── SeatMap/
│ │ ├── Layout/
│ │ └── common/
│ │ ├── context/
│ │ │ └── BookingContext.jsx
│ │ └── utils/
│ │ ├── constants.js
│ │ ├── localStorage.js
│ │ ├── validation.js
│ │ └── boardingAlgorithm.js
│ │
│ ├── pages/
│ │ ├── BookingPage.jsx
│ │ └── BoardingPage.jsx
│ │
│ ├── App.js
│ └── index.js
│
├── package.json
├── package-lock.json
└── README.md
---
---
## Prerequisites

Make sure the following are installed:

- Node.js (v14 or above)
- npm 
- VS Code (recommended)

---

##  Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd bus-booking-system

```
## Installation & Setup

### 2️⃣ Install Dependencies

```bash
npm install
```
##  Run the Application

```bash
npm start
```

The application will run at:
```bash
http://localhost:3000 
```

## How to Use the Application

### Create Booking

- Select travel date  
- Enter a valid 10-digit Indian mobile number  
- Select seats from the seat map (maximum 6)  
- Click **Book Tickets**  
- View booking confirmation  

---

### View Bookings & Track Boarding

- Go to **Bookings tab**  
- View all bookings for the selected date  
- Toggle **Boarded / Not Boarded** status  
- Monitor boarding statistics and progress  

---

### Edit Booking

- Click **Edit**  
- Update seat selection  
- Click **Update Booking**  

---

###  Cancel Booking

- Click **Cancel**  
- Confirm the cancellation  

---

##  Optimal Boarding Algorithm

To minimize total boarding time:

1. Identify the farthest seat row for each booking  
2. Sort bookings from **back → front**  
3. Board passengers in that sequence  

### Result

- Natural boarding time → **N × 60 seconds**  
- Optimal boarding time → **60 seconds**

This avoids passenger blocking inside the bus.

---

##  Features

### Booking Management

- Unique Booking ID generation  
- Seat availability validation  
- Duplicate booking prevention  
- Maximum 6 seats per mobile number per day  

---

### Boarding Dashboard

- Total bookings  
- Total passengers  
- Boarded passengers  
- Not boarded passengers  
- Boarding progress bar  

---

### Time Comparison

- Natural boarding time  
- Optimal boarding time  
- Time savings calculation  

---

### Search & Sorting

**Search by:**

- Booking ID  
- Mobile Number  

**Sort by:**

- Sequence  
- Booking ID  
- Seats  
- Mobile  

---

### Responsive Design

- Mobile  
- Tablet  
- Desktop  

---

###  Accessibility

- ARIA labels  
- Keyboard navigation  
- Screen-reader friendly  

---

##  Data Storage

- Uses **Browser Local Storage**  
- No backend required  
- Data persists after page refresh (same browser)  

---

## Performance Optimizations

- React.memo for seat rendering  
- useCallback for event handlers  
- Efficient Context state updates  
- Optimized re-renders  

---

## Future Enhancements

- User authentication  
- Multiple bus routes  
- Payment integration  
- PDF ticket download  
- Email/SMS notifications  
- Cloud database (MongoDB / MySQL)  
- PWA offline support  
- Dark mode  
#
