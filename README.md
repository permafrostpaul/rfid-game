# RFID Student Flashcard Game

This project is a web-based flashcard game that uses an RFID card scanner for student login and session management. It's designed as an engaging way for students to review course material, with features like difficulty levels, timed questions, and a leaderboard.

## Features

- **RFID Login:** Students scan a unique RFID card to log in or sign up automatically.
- **Web-Based Game:** A responsive flashcard game that runs in any web browser.
- **Difficulty Levels:** Questions are categorized into Easy (5 pts), Medium (10 pts), and Hard (20 pts).
- **Timed Questions:** Each question has a 60-second timer.
- **Full Stack:** Built with an ESP32 for hardware, a Node.js/Express backend, and a MySQL database.

## Project Structure

- `/backend`: Contains the Node.js server and the `public` folder for all frontend files (HTML, CSS, JS).
- `/esp32-firmware`: Contains the Arduino (`.ino`) code for the ESP32.
- `/database`: Contains the `schema.sql` file needed to set up the MySQL database.

## Hardware Components

- ESP32 Development Board
- MFRC522 RFID Scanner
- LEDs & Buzzer
- Breadboard and Jumper Wires

## Setup & Installation

### 1. Database

- Ensure you have XAMPP installed and the MySQL service is running.
- Open phpMyAdmin and create a new database named `rfid_game_db`.
- Run the script located at `/database/schema.sql` to create all tables and populate the questions.

### 2. Backend

- Navigate to the `/backend` directory: `cd backend`
- Install dependencies: `npm install`
- Start the server: `node server.js`
- The server will run at `http://<your-computer-ip>:3000`.

### 3. ESP32 Firmware

- Open the `.ino` file from `/esp32-firmware` in the Arduino IDE.
- Install the required libraries (`MFRC522`, `ArduinoJson`).
- Update the Wi-Fi credentials and the `serverUrl` variable to point to your backend's IP address.
- Upload the sketch to your ESP32.
