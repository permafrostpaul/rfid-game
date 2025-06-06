/*********************************************************************************
 * RFID Student Game System - ESP32 Main Code
 *
 * Designed for a 38-pin ESP32 with an MFRC522 RFID reader, two LEDs,
 * and a buzzer.
 *
 *
 * What this code does:
 * 1. Connects the ESP32 to your Wi-Fi network.
 * 2. Reads the Unique ID (UID) from an RFID student card.
 * 3. Sends this UID to your backend server as a JSON object.
 * 4. Listens for a response from the server (e.g., "correct_answer").
 * 5. Controls the green/red LEDs and the buzzer to give physical feedback.
 *
 *********************************************************************************/

// --- LIBRARIES ---
#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CONFIGURATION ---
// ** 1. FILL IN YOUR WI-FI CREDENTIALS **
// WiFi credentials
const char* ssid = "SKYFiber_MESH_6579";
const char* password = "548164137";

// ** 2. FILL IN YOUR BACKEND SERVER URL **
// This is the API endpoint where the ESP32 will send the scanned RFID UID.
const char* serverUrl = "http://192.168.55.135:3000/api/scan";

// ** 3. HARDWARE PIN DEFINITIONS (Matches our wiring diagram) **
// RFID Reader (MFRC522) Pins
#define RST_PIN   4   // Reset Pin
#define SS_PIN    5   // Slave Select Pin (SDA/CS)

// Feedback Component Pins
#define GREEN_LED_PIN 2
#define RED_LED_PIN   15
#define BUZZER_PIN    12

// --- GLOBAL VARIABLES ---
MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance
String lastScannedUID = "";       // Stores the last UID to prevent spamming
unsigned long lastScanTime = 0;   // Stores the time of the last scan
const long scanCooldown = 5000;   // 5-second cooldown between identical scans

// --- FUNCTION PROTOTYPES ---
void setupWifi();
void sendUIDToServer(String uid);
void triggerSuccess();
void triggerFailure();
void triggerNeutral();
String getUIDString(byte *buffer, byte bufferSize);


// =============================================================================
// SETUP: Runs once when the ESP32 boots up
// =============================================================================
void setup() {
  Serial.begin(115200); // Start serial communication for debugging
  Serial.println("\nInitializing RFID Game System...");

  // Initialize hardware output pins
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Ensure LEDs are off at the start
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);

  // Initialize the RFID reader
  SPI.begin();          // Init SPI bus for the RFID reader
  mfrc522.PCD_Init();   // Init MFRC522
  Serial.println("RFID Reader Initialized.");
  Serial.print("Firmware Version: ");
  mfrc522.PCD_DumpVersionToSerial(); // A good way to check if the reader is connected

  // Connect to Wi-Fi
  setupWifi();

  Serial.println("\nSystem Ready. Please scan a card.");
  triggerNeutral(); // Beep once to signal the system is ready
}


// =============================================================================
// LOOP: Runs continuously after setup
// =============================================================================
void loop() {
  // Look for a new RFID card
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return; // If no card, do nothing and wait.
  }

  // Try to read the card that was found
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return; // If reading fails, do nothing and wait.
  }

  // --- A card has been successfully scanned ---

  // Get the UID and convert it to a readable string format
  String currentUID = getUIDString(mfrc522.uid.uidByte, mfrc522.uid.size);
  Serial.print("Card Scanned. UID: ");
  Serial.println(currentUID);

  // Cooldown check: Prevents a card left on the reader from spamming the server
  if (currentUID == lastScannedUID && millis() - lastScanTime < scanCooldown) {
      Serial.println("This card was scanned recently. Ignoring.");
  } else {
      // It's a new scan, so update the tracking variables
      lastScannedUID = currentUID;
      lastScanTime = millis();

      // Send the UID to our backend server for processing
      sendUIDToServer(currentUID);
  }

  // Halt communication with the card to allow for new scans
  mfrc522.PICC_HaltA();
  // Stop encryption on the reader
  mfrc522.PCD_StopCrypto1();
}


// =============================================================================
// --- HELPER FUNCTIONS ---
// =============================================================================

/**
 * @brief Connects the ESP32 to the configured Wi-Fi network with a timeout.
 */
void setupWifi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retries++;
    if (retries > 20) {
      Serial.println("\nFailed to connect to WiFi. Check credentials/network and reboot.");
      // Blink the red light continuously to signal a critical connection error
      while(true) {
        digitalWrite(RED_LED_PIN, !digitalRead(RED_LED_PIN));
        delay(250);
      }
    }
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

/**
 * @brief Sends the scanned RFID UID to the backend server via HTTP POST.
 * @param uid The UID of the card as a String.
 */
void sendUIDToServer(String uid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Create a JSON object to send: {"uid": "XX:XX:XX:XX"}
    StaticJsonDocument<128> doc;
    doc["uid"] = uid;

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.println("Sending data to server...");
    Serial.println(requestBody);

    // Send the actual HTTP POST request
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response from server: ");
      Serial.println(response);

      // --- Process the server's response to trigger feedback ---
      // We expect the server to reply with JSON, e.g., {"action": "correct_answer"}
      StaticJsonDocument<256> jsonResponse;
      deserializeJson(jsonResponse, response);
      const char* action = jsonResponse["action"]; // Extracts the value of the "action" key

      // Compare the action string and call the correct feedback function
      if (strcmp(action, "correct_answer") == 0) {
        triggerSuccess();
      } else if (strcmp(action, "wrong_answer") == 0) {
        triggerFailure();
      } else {
        // Handle other cases like "login_success" or "logout" as a neutral event
        triggerNeutral();
      }

    } else {
      Serial.print("Error on sending POST request: ");
      Serial.println(httpResponseCode);
      triggerFailure(); // Use the failure feedback for network errors
    }

    http.end(); // Free resources
  } else {
    Serial.println("WiFi is disconnected. Cannot send data.");
    triggerFailure();
  }
}

/**
 * @brief Converts the RFID UID from a byte array to a readable String.
 */
String getUIDString(byte *buffer, byte bufferSize) {
  String uid = "";
  for (byte i = 0; i < bufferSize; i++) {
    // Add a leading zero if the byte is less than 16
    if (buffer[i] < 0x10) {
      uid += "0";
    }
    uid += String(buffer[i], HEX); // Convert byte to a 2-digit hex string
    if (i < bufferSize - 1) {
      uid += ":"; // Add a colon separator between bytes
    }
  }
  uid.toUpperCase(); // Convert to uppercase for consistency
  return uid;
}

/**
 * @brief Triggers "Success" feedback: green light on, happy dual-tone beep.
 */
void triggerSuccess() {
  Serial.println("Feedback: SUCCESS");
  digitalWrite(GREEN_LED_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 100); // High pitch, short beep
  delay(120);
  tone(BUZZER_PIN, 1200, 150); // Slightly higher pitch
  delay(1500); // Keep the light on for 1.5 seconds
  digitalWrite(GREEN_LED_PIN, LOW);
}

/**
 * @brief Triggers "Failure" feedback: red light on, low-tone sad beep.
 */
void triggerFailure() {
  Serial.println("Feedback: FAILURE");
  digitalWrite(RED_LED_PIN, HIGH);
  tone(BUZZER_PIN, 300, 500); // Low pitch, long beep
  delay(1500); // Keep the light on for 1.5 seconds
  digitalWrite(RED_LED_PIN, LOW);
}

/**
 * @brief Triggers "Neutral" feedback: a simple, single beep. For login or ready state.
 */
void triggerNeutral() {
   Serial.println("Feedback: NEUTRAL");
   tone(BUZZER_PIN, 800, 150); // Medium pitch, short beep
}