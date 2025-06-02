#include <LiquidCrystal_I2C.h>

#define RX_PIN 4  
#define TX_PIN 5  

// NeoSWSerial XBeeSerial(RX_PIN, TX_PIN);  
LiquidCrystal_I2C lcd(0x27, 20, 4);

String status = "On";

uint8_t stoppedFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 7E FF FE 00 00 53 53 FE  MD to CD Alerts "SS"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x53, 0x53,
  0xFE
}; 

uint8_t restartFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 7E FF FE 00 00 53 52 FF  MD to CD Alerts "SR"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x53, 0x52,
  0xFF
}; 

//7E 00 10 10 01 00 13 A2 00 42 3E 9A 50 FF FE 00 00 43 53 3C

// void setup() {
//   Serial.begin(9600);
//   XBeeSerial.begin(9600);
//   Serial.println("Waiting for XBee data...");
//   delay(5000);
// }

// void loop() {
//   // XBeeSerial.write(stoppedFrame, sizeof(stoppedFrame));
//   // delay(3000);
//   // XBeeSerial.write(restartFrame, sizeof(stoppedFrame));
//   // delay(3000);
  
 
// }

const byte sensorPin = 9; // PB1
volatile unsigned long lastPulseTime = 0;

bool machineRunning = false;  // Tracks if machine was last known running

void setup() {
    Serial.begin(9600);
    pinMode(sensorPin, INPUT);
    pinMode(10, OUTPUT);
    // Enable pin change interrupt for PB1 (PCINT1)
    PCICR |= (1 << PCIE0);      // Enable PCINT0..7 (Port B)
    PCMSK0 |= (1 << PCINT1);    // Enable interrupt on PCINT1 (PB1)
}

ISR(PCINT0_vect) {
    static byte lastState = LOW;
    byte currentState = PINB & (1 << PB1);

    if (currentState && !lastState) { // Rising edge detected
        lastPulseTime = millis();
    }

    lastState = currentState;
}

void loop() {
    unsigned long now = millis();

    if (now - lastPulseTime < 100) {
        if (!machineRunning) {
            // Transitioned to RUNNING
            Serial.write(restartFrame, sizeof(restartFrame));
            Serial.println("Sent SR (Restart)");
            machineRunning = true;
        }
        digitalWrite(10, HIGH);
    } else {
        if (machineRunning) {
            // Transitioned to STOPPED
            Serial.write(stoppedFrame, sizeof(stoppedFrame));
            Serial.println("Sent SS (Stopped)");
            machineRunning = false;
        }
        digitalWrite(10, LOW);
    }

    delay(50); // Check ~20 times per second
}

