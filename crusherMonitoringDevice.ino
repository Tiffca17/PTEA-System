#include <LiquidCrystal_I2C.h>

#define RX_PIN 4  
#define TX_PIN 5  
 
LiquidCrystal_I2C lcd(0x27, 20, 4);

String status = "On";

uint8_t stoppedFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 7E FF FE 00 00 43 53 0E  MD to CD Alerts "CS"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x53,
  0x0E
}; 

uint8_t restartFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 7E FF FE 00 00 43 52 0F  MD to CD Alerts "CR"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x52,
  0x0F
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
            Serial.println("Sent CR (Restart)");
            machineRunning = true;
        }
        digitalWrite(10, HIGH);
    } else {
        if (machineRunning) {
            // Transitioned to STOPPED
            Serial.write(stoppedFrame, sizeof(stoppedFrame));
            Serial.println("Sent CS (Stopped)");
            machineRunning = false;
        }
        digitalWrite(10, LOW);
    }

    delay(50); // Check ~20 times per second
}

