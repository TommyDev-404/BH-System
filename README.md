# Boarding House Management System

A simple **Boarding House (BH) Management System** designed to help manage **boarders, rooms, payments and monitor the status of the boarding house** efficiently.  
This project is aimed at providing an easy-to-use interface for administrators to track tenants, assign rooms, and monitor payment history.

# Features

- **Boarder Page Part**
  - Add, update, display and remove boarders, status, int(
  - View complete list of tenants
  - Sort them by room(default), name(alphabetical order) and date rented
  - Search boarders by their name
  - Once a boarder is removed, all his/her payment history will be removed also and the room he/she stayed will be added a space

- **Room Page Part**
  - Add, edit and delete room details
  - Assign boarders to rooms
  - Track room availability
  - Edit is limited to status (under maintenance or available) and capacity of room
  - When room is  deleted all boarders inside of that room will be removed also

- **Payment Page Part**
  - Record payments and advances
  - Generate payment history per boarder
  - Calculate outstanding balances
  - Support for monthly income tracking
  - Able user to add payments or advanced easily

- **Authentication**
  - Admin login/logout
  - Secure access to system features
  - When user logout, it cannot go back to the homepage
  - User can change password

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (with Axios Library/Vanilla JS)  
- **Backend:** Python (Flask)
- **Database:** MariaDB on phpmyadmin

## Note : Anyone can copy this code and try it, and if there are bugs please message me it would help me a lot
-FB Acc: Rustom Galicia
