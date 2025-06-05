String status = "On";

uint8_t stoppedFrame[] = {
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x53,
  0x0E
}; 

uint8_t restartFrame[] = {
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x7E,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x52,
  0x0F
}; 

const byte sensorPin = 9; // PB1
volatile unsigned long pulseCount = 0;
volatile unsigned long lastInterruptTime = 0;

bool machineRunning = false;
unsigned long lastStatusCheck = 0;
const unsigned long CHECK_INTERVAL = 1000; // Check every 1 second for faster response
const unsigned long MIN_PULSE_INTERVAL = 5; // Debounce: minimum 5ms between valid pulses

// Speed thresholds (pulses per second)
const unsigned long MIN_RUNNING_SPEED = 10; // Minimum pulses/sec to consider "running"
const unsigned long MIN_RESTART_SPEED = 15;  // Minimum pulses/sec to consider "restarted"

// For calculating average speed over multiple readings
const int SPEED_HISTORY_SIZE = 3;
unsigned long speedHistory[SPEED_HISTORY_SIZE] = {0};
int speedHistoryIndex = 0;

void setup() {
    Serial.begin(9600);
    pinMode(sensorPin, INPUT);
    pinMode(10, OUTPUT);
    
    // Enable pin change interrupt for PB1 (PCINT1)
    PCICR |= (1 << PCIE0);      // Enable PCINT0..7 (Port B)
    PCMSK0 |= (1 << PCINT1);    // Enable interrupt on PCINT1 (PB1)
    
    lastStatusCheck = millis();
}

ISR(PCINT0_vect) {
    static byte lastState = LOW;
    byte currentState = PINB & (1 << PB1);
    unsigned long currentTime = millis();

    // Rising edge detected with debouncing
    if (currentState && !lastState) {
        // Debounce: ignore pulses too close together
        if (currentTime - lastInterruptTime > MIN_PULSE_INTERVAL) {
            pulseCount++;
            lastInterruptTime = currentTime;
        }
    }

    lastState = currentState;
}

unsigned long calculateAverageSpeed() {
    unsigned long total = 0;
    int validReadings = 0;
    
    for (int i = 0; i < SPEED_HISTORY_SIZE; i++) {
        if (speedHistory[i] > 0) {
            total += speedHistory[i];
            validReadings++;
        }
    }
    
    return validReadings > 0 ? total / validReadings : 0;
}

void loop() {
    unsigned long now = millis();
    
    // Check status every CHECK_INTERVAL
    if (now - lastStatusCheck >= CHECK_INTERVAL) {
        // Temporarily disable interrupts to safely read volatile variables
        noInterrupts();
        unsigned long currentPulseCount = pulseCount;
        pulseCount = 0; // Reset counter for next interval
        interrupts();
        
        // Calculate current speed (pulses per second)
        unsigned long currentSpeed = (currentPulseCount * 1000) / CHECK_INTERVAL;
        
        // Store in history for averaging
        speedHistory[speedHistoryIndex] = currentSpeed;
        speedHistoryIndex = (speedHistoryIndex + 1) % SPEED_HISTORY_SIZE;
        
        // Calculate average speed
        unsigned long averageSpeed = calculateAverageSpeed();
        
        // Determine machine state based on speed
        bool shouldBeRunning;
        if (machineRunning) {
            // If currently running, use lower threshold to avoid flickering
            shouldBeRunning = averageSpeed >= MIN_RUNNING_SPEED;
        } else {
            // If currently stopped, use higher threshold to confirm restart
            shouldBeRunning = averageSpeed >= MIN_RESTART_SPEED;
        }
        
        // Check for state change
        if (shouldBeRunning && !machineRunning) {
            // Transitioned to RUNNING
            Serial.write(restartFrame, sizeof(restartFrame));
            // Serial.println("Fan SPEED UP - Sent CR (Restart)");
            machineRunning = true;
            digitalWrite(10, HIGH);
        } 
        else if (!shouldBeRunning && machineRunning) {
            // Transitioned to STOPPED (slowed down)
            Serial.write(stoppedFrame, sizeof(stoppedFrame));
            // Serial.println("Fan SLOWED DOWN - Sent CS (Stopped)");
            machineRunning = false;
            digitalWrite(10, LOW);
        }
        
        lastStatusCheck = now;
    }
    
    delay(50); 
}
