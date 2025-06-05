#include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// RS-485 Pins
#define PIN_RS485_RX    5
#define PIN_RS485_TX    4
#define PIN_RS485_DE    6
#define PIN_RS485_RE    3

// XBee Pins
#define XBEE_RX_PIN     7
#define XBEE_TX_PIN     8

// RS-485 Serial
SoftwareSerial RS485(PIN_RS485_RX, PIN_RS485_TX);

// XBee Serial
SoftwareSerial Xbee(XBEE_RX_PIN, XBEE_TX_PIN);

LiquidCrystal_I2C lcd(0x27, 20, 4);

uint8_t modbus_frame[] = {
    0x01, 0x04, 0x00, 0x00, 0x00, 0x02, 0xCB, 0xF0
};

//7E 00 11 10 01 00 13 A2 00 42 3E 9A 5F FF FE 00 00 31 35 34 29

uint8_t bsFrame[] = { 
  0x7E, 0x00, 0x11, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x5F,
  0xFF, 0xFE, 0x00, 0x00,
  0x31, 0x35, 0x34,
  0x29
}; 

void setup() {
    Serial.begin(9600);  
    RS485.begin(9600);
    Xbee.begin(9600);

    pinMode(PIN_RS485_DE, OUTPUT);
    pinMode(PIN_RS485_RE, OUTPUT);

    digitalWrite(PIN_RS485_DE, LOW);
    digitalWrite(PIN_RS485_RE, LOW);

    lcd.init();
    lcd.backlight();
    lcd.setCursor(1, 0);
    lcd.print("Belt Scale Device");

    Serial.println("Setup Complete");
}

void loop() {
    lcd.setCursor(2, 1);
    lcd.print("Requesting belt");
    lcd.setCursor(3, 2);
    lcd.print("scale data ...");

    sendModbusRequest();
    delay(2000);  
    lcd.clear();

    String data = readRS485();
    
    sendXBeeAPIFrame(data);
  
    Xbee.write(bsFrame, sizeof(bsFrame));

    delay(4000);  
}

void sendModbusRequest() {
    digitalWrite(PIN_RS485_DE, HIGH);
    digitalWrite(PIN_RS485_RE, HIGH);

    for (uint8_t i = 0; i < sizeof(modbus_frame); i++) {
        RS485.write(modbus_frame[i]);
    }
    RS485.flush();

    digitalWrite(PIN_RS485_DE, LOW);
    digitalWrite(PIN_RS485_RE, LOW);

    Serial.println("Modbus frame sent.");
}

String readRS485() {
    String msg = "";

    lcd.clear();
    while (!RS485.available()) {
        lcd.setCursor(1, 0);
        lcd.print("Belt Scale Device");
        lcd.setCursor(4, 1);
        lcd.print("Waiting for");
        lcd.setCursor(4, 2);
        lcd.print("response ...");
    }

    if (RS485.available()) {
        msg = RS485.readStringUntil('\n');
        lcd.clear();
        lcd.setCursor(1, 0);
        lcd.print("Belt Scale Device");
        lcd.setCursor(3, 1);
        lcd.print("Data received:");
        lcd.setCursor(5, 2);
        lcd.print(msg);
        Serial.println("RS-485 Data: " + msg);
        delay(3000);
    }
    return msg;
}

void sendXBeeAPIFrame(String data) {
    uint8_t payload[data.length()];
    data.getBytes(payload, data.length() + 1);

    uint16_t frameLen = 14 + data.length();  // 14 header bytes + payload

    uint8_t frame[frameLen + 4];  // 4 extra: start delimiter, length, checksum
    uint8_t i = 0;

    frame[i++] = 0x7E;                 // Start delimiter
    frame[i++] = ((frameLen) >> 8);    // Length MSB
    frame[i++] = (frameLen & 0xFF);    // Length LSB

    frame[i++] = 0x10;                 // Frame type: Transmit Request
    frame[i++] = 0x01;                 // Frame ID

    // 64-bit destination address: 0013A200423E9A50
    frame[i++] = 0x00;
    frame[i++] = 0x13;
    frame[i++] = 0xA2;
    frame[i++] = 0x00;
    frame[i++] = 0x42;
    frame[i++] = 0x3E;
    frame[i++] = 0x9A;
    frame[i++] = 0x50;

    frame[i++] = 0xFF;                 // 16-bit address unknown
    frame[i++] = 0xFE;

    frame[i++] = 0x00;                 // Broadcast radius
    frame[i++] = 0x00;                 // Options

    // Add payload
    for (uint8_t j = 0; j < data.length(); j++) {
        frame[i++] = payload[j];
    }

    // Calculate checksum
    uint8_t checksum = 0;
    for (uint8_t j = 3; j < i; j++) {
        checksum += frame[j];
    }
    checksum = 0xFF - checksum;

    frame[i++] = checksum;

    // Send frame
    Serial.println("Sending XBee API Frame...");
    Xbee.write(frame, i);

}
