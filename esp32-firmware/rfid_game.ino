// --- LIBRARIES ---
#include <WiFi.h>
#include <WebServer.h>      // The ESP32's own web server library
#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CONFIGURATION ---
const char* ssid = "SKYFiber_MESH_6579";
const char* password = "548164137";
const char* scanUrl = "http://192.168.55.135:3000/api/scan";

// --- HARDWARE PINS ---
#define RST_PIN 4
#define SS_PIN 5
#define GREEN_LED_PIN 2
#define RED_LED_PIN 15
#define BUZZER_PIN 12

// --- GLOBAL OBJECTS & VARIABLES ---
MFRC522 mfrc522(SS_PIN, RST_PIN);
WebServer server(80); // Create a web server on port 80 (standard for HTTP)

unsigned long lastScanTime = 0;
const long scanCooldown = 5000; // 5-second cooldown after a scan to prevent spam

// --- Function Prototypes ---
void handleSuccess();
void handleFailure();
void handleNotFound();
void checkAndSendCard();
void triggerSuccess();
void triggerFailure();
String getUIDString(byte* buffer, byte bufferSize);

// =============================================================================
// SETUP
// =============================================================================
void setup() {
    Serial.begin(115200);
    Serial.println("\nInitializing RFID Game System (Web Server Mode)...");

    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(RED_LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);

    SPI.begin();
    mfrc522.PCD_Init();
    
    // Connect to Wi-Fi
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());

    // --- SETUP THE WEB SERVER ROUTES ---
    server.on("/success", HTTP_GET, handleSuccess); // For correct answer feedback
    server.on("/failure", HTTP_GET, handleFailure); // For wrong answer feedback
    server.onNotFound(handleNotFound);

    server.begin(); // Start the server
    Serial.println("HTTP server started. Ready for commands and scans.");
}

// =============================================================================
// MAIN LOOP
// =============================================================================
void loop() {
    server.handleClient(); // Handle incoming web commands from the frontend
    checkAndSendCard();    // Continuously check for new RFID cards
}

// =============================================================================
// --- WEB SERVER HANDLER FUNCTIONS ---
// =============================================================================

// Called when the frontend sends a GET request to http://<ESP32_IP>/success
void handleSuccess() {
    server.send(200, "text/plain", "Success action triggered");
    Serial.println("Received /success command from frontend.");
    triggerSuccess();
}

// Called when the frontend sends a GET request to http://<ESP32_IP>/failure
void handleFailure() {
    server.send(200, "text/plain", "Failure action triggered");
    Serial.println("Received /failure command from frontend.");
    triggerFailure();
}

void handleNotFound() {
    server.send(404, "text/plain", "Not found");
}

// =============================================================================
// --- RFID & TRIGGER FUNCTIONS ---
// =============================================================================

void checkAndSendCard() {
    // Exit if it's too soon after the last scan
    if (millis() - lastScanTime < scanCooldown) {
        return;
    }

    if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
        return;
    }

    // If we get here, a new card has been scanned after the cooldown
    lastScanTime = millis(); // Reset the timer

    String uid = getUIDString(mfrc522.uid.uidByte, mfrc522.uid.size);
    Serial.print("Card Scanned. UID: ");
    Serial.println(uid);

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(scanUrl);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<128> doc;
        doc["uid"] = uid;
        String requestBody;
        serializeJson(doc, requestBody);

        int httpResponseCode = http.POST(requestBody);
        if (httpResponseCode == 200) {
            Serial.println("Login UID sent successfully to server.");
            // Just light the green LED for login, no sound
            digitalWrite(GREEN_LED_PIN, HIGH);
            delay(1500);
            digitalWrite(GREEN_LED_PIN, LOW);
        } else {
            Serial.print("Login UID send failed, code: ");
            Serial.println(httpResponseCode);
            triggerFailure();
        }
        http.end();
    }
    
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
}

// These functions are now only called by the web handlers
void triggerSuccess() {
    Serial.println("Feedback: CORRECT ANSWER");
    digitalWrite(GREEN_LED_PIN, HIGH);
    tone(BUZZER_PIN, 1200, 150);
    delay(200);
    tone(BUZZER_PIN, 1600, 200);
    delay(1000);
    digitalWrite(GREEN_LED_PIN, LOW);
}

void triggerFailure() {
    Serial.println("Feedback: WRONG ANSWER");
    digitalWrite(RED_LED_PIN, HIGH);
    tone(BUZZER_PIN, 300, 750);
    delay(1000);
    digitalWrite(RED_LED_PIN, LOW);
}

String getUIDString(byte* buffer, byte bufferSize) {
    String uid = "";
    for (byte i = 0; i < bufferSize; i++) {
        if (buffer[i] < 0x10) uid += "0";
        uid += String(buffer[i], HEX);
        if (i < bufferSize - 1) uid += ":";
    }
    uid.toUpperCase();
    return uid;
}