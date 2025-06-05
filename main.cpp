

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
// #include "env.h"
#include <XBee.h>
#include <LiquidCrystal_I2C.h>
#include  <Wire.h>

#define XBeeSerial Serial2
#define RX_PIN 16
#define TX_PIN 17

LiquidCrystal_I2C lcd(0x27,  20, 4);

const int MAX_FRAME_SIZE = 128;
uint8_t frameBuffer[MAX_FRAME_SIZE];
int bufferIndex = 0;
bool collectingFrame = false;
int expectedLength = 0;

char addr[17];             // Address string: 16 hex chars + null terminator
char receivedData[64];     // Payload buffer (adjust size as needed)

void postBSDCData(String tonnes){
    HTTPClient http;
    String requestBody;
    String plant = "Relief Bush";
    String material = "Raw";

    int num = tonnes.toInt();
  
    String path = "https://api.p-tea.com/production";
  
    http.begin(path);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Content-Length", "62");
  
    JsonDocument doc;
  
    doc["plant"] = plant;
    doc["material"] = material;
    doc["tonnes"] = num;

    doc.shrinkToFit();
  
    serializeJson(doc, requestBody);
  
    int httpResponseCode = http.POST(requestBody);
    
    Serial.print("HERE IS THE RESPONSE: ");
    Serial.println(http.getString());
    Serial.println();
  
    http.end();
}

void postCDData(String code){
    HTTPClient http;
    String requestBody;
    String message;
    String plant;
    String machine;
    //   String code;
    String path = "https://api.p-tea.com/activity";

    http.begin(path);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Content-Length", "62");

    JsonDocument doc;

    if (code == "CS") {
        message = "Crusher has stopped!";
        plant = "Relief Bush";
        machine = "Crusher";
    } 
    else if (code == "CR") {
        message = "Crusher has restarted!";
        plant = "Relief Bush";
        machine = "Crusher";
    } 
    else if (code == "SS") {
        message = "Screen has stopped!";
        plant = "Relief Bush";
        machine = "Screen";
    } 
    else if (code == "SR") {
        message = "Screen has restarted!";
        plant = "Relief Bush";
        machine = "Screen";
    } 

    doc["plant"] = plant;
    doc["machine"] = machine;
    doc["message"] = message;
    doc["code"] = code;

    doc.shrinkToFit();

    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    
    Serial.print("HERE IS THE RESPONSE: ");
    Serial.println(http.getString());
    Serial.println();

    http.end();
}

void parseXBeeFrame(uint8_t *frame, size_t length) {
  if (length < 4 || frame[0] != 0x7E) return;

  uint16_t frameLength = (frame[1] << 8) | frame[2];
  if (frameLength + 4 != length) return;

  uint8_t frameType = frame[3];
  if (frameType == 0x90) {
    // Extract source address (8 bytes)
    for (int i = 0; i < 8; i++) {
      sprintf(&addr[i * 2], "%02x", frame[4 + i]);  // Lowercase hex
    }

    // Extract payload (after addr, net addr, options: start at frame[15])
    int payloadLength = frameLength - 12;
    if (payloadLength > sizeof(receivedData) - 1) payloadLength = sizeof(receivedData) - 1;

    for (int i = 0; i < payloadLength; i++) {
      receivedData[i] = (char)frame[15 + i];
    }
    receivedData[payloadLength] = '\0';

    // Debug prints
    Serial.print("Source Address: ");
    Serial.println(addr);
    Serial.print("Payload: ");
    Serial.println(receivedData);

    // ---- Your logic block here ----
    //Check WiFi connection status
  if(WiFi.status()== WL_CONNECTED){
    Serial.println("Wifi");
    if (strcmp(addr, "0013a200423e9a50") == 0){
        postBSDCData(receivedData);
        lcd.setCursor(8, 0);
        lcd.print("CMS");
        lcd.setCursor(1, 1);
        lcd.print("BSDC Received Data:");
        lcd.setCursor(0, 2);
        lcd.print(receivedData);
    }
    else if (strcmp(addr, "0013a200423e9a7e") == 0){ //13a200423e9a7e  13a200423e9a0c
        Serial.println("if");
        postCDData(receivedData);
        lcd.setCursor(8, 0);
        lcd.print("CMS");
        lcd.setCursor(1, 1);
        lcd.print("CD Received Data:");
        lcd.setCursor(0, 2);
        lcd.print(receivedData);
    }
    receivedData[0] = '\0';  
  }
  else {
    Serial.println("WiFi Disconnected");
  }
  }
}

void setup() {
    Serial.begin(9600);
    XBeeSerial.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);
    lcd.init();
    lcd.backlight();
    Serial.println("ESP32 ready to receive XBee frames...");
    WiFi.begin("MonaConnect", "");
    lcd.setCursor(0,0);
    Serial.println("Connecting");
    while(WiFi.status() != WL_CONNECTED) 
    {
        delay(1000);
        lcd.setCursor(0,1);
        lcd.print(".");
    }
    // lcd.setCursor(0,0);
    // lcd.print("hello");
    Serial.println("");
    Serial.print("Connected to WiFi network with IP Address: ");
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print(WiFi.localIP());
    delay(2000);
    lcd.clear();
}

void loop() {
  while (XBeeSerial.available()) {
    uint8_t incomingByte = XBeeSerial.read();

    if (!collectingFrame) {
      if (incomingByte == 0x7E) {
        bufferIndex = 0;
        frameBuffer[bufferIndex++] = incomingByte;
        collectingFrame = true;
      }
    } else {
      if (bufferIndex < MAX_FRAME_SIZE) {
        frameBuffer[bufferIndex++] = incomingByte;

        if (bufferIndex == 3) {
          expectedLength = (frameBuffer[1] << 8) | frameBuffer[2];
        }

        if (bufferIndex == expectedLength + 4) {
          parseXBeeFrame(frameBuffer, bufferIndex);
          collectingFrame = false;
          bufferIndex = 0;
        }
      } else {
        collectingFrame = false;
        bufferIndex = 0;
      }
    }
  }
}

