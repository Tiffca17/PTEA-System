#include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include <XBee.h>

#define RX_PIN 4  
#define TX_PIN 5  

SoftwareSerial XBeeSerial(RX_PIN, TX_PIN);  
LiquidCrystal_I2C lcd(0x27, 20, 4);

XBee xbee = XBee();
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();

String crusherStatus = "Off";
String screenStatus = "Off";

uint8_t crusherStoppedFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 5F FF FE 00 00 43 53 2D  CD to CMS Alerts "CS"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x5F,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x53,
  0x2D
}; 

uint8_t crusherRestartFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 5F FF FE 00 00 43 52 2E  CD to CMS Alerts "CR"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x5F,
  0xFF, 0xFE, 0x00, 0x00,
  0x43, 0x52,
  0x2E
}; 

uint8_t screenStoppedFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 5F FF FE 00 00 53 53 1D  CD to CMS Alerts "SS"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x5F,
  0xFF, 0xFE, 0x00, 0x00,
  0x53, 0x53,
  0x1D
}; 

uint8_t screenRestartFrame[] = {  //7E 00 10 10 01 00 13 A2 00 42 3E 9A 5F FF FE 00 00 53 52 1E  CD to CMS Alerts "SR"
  0x7E, 0x00, 0x10, 0x10, 0x01,
  0x00, 0x13, 0xA2, 0x00, 0x42, 0x3E, 0x9A, 0x5F,
  0xFF, 0xFE, 0x00, 0x00,
  0x53, 0x52,
  0x1E
}; 

void setup() {
  Serial.begin(9600);
  XBeeSerial.begin(9600);
  xbee.setSerial(XBeeSerial);  // attach SoftwareSerial to XBee object

  pinMode(7, OUTPUT); 
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);

  // Serial.println("Waiting for XBee data...");

  lcd.init();
  lcd.backlight();
}

void loop() {

  lcd.setCursor(3, 0);
  lcd.print("Control Device      ");  // pad with spaces to clear line
  lcd.setCursor(0, 1);
  lcd.print("Crusher:" + crusherStatus + "      ");
  lcd.setCursor(0, 2);
  lcd.print("Screen:" + screenStatus + "      ");
  // lcd.print(crusherStatus + "         ");      // pad with spaces to clear line

  xbee.readPacket();

  if (xbee.getResponse().isAvailable()) {
    if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
      xbee.getResponse().getZBRxResponse(rx);

      // Get the payload as a string
      int dataLen = rx.getDataLength();
      String receivedData = "";

      for (int i = 0; i < dataLen; i++) {
        receivedData += (char)rx.getData()[i];
      }

      receivedData.trim();  // clean up spaces/newlines

      Serial.print("Received: ");
      Serial.println(receivedData);

      if (receivedData == "CS") {
        digitalWrite(8, HIGH);
        crusherStatus = "Off";
        XBeeSerial.write(crusherStoppedFrame, sizeof(crusherStoppedFrame));
        lcd.setCursor(0, 1);
        lcd.print("Crusher:" + crusherStatus + "      ");
        digitalWrite(10,HIGH);
        delay(2000);
        digitalWrite(10,LOW);
      }
      else if (receivedData == "CR") {
        digitalWrite(8, LOW);
        crusherStatus = "On";
        XBeeSerial.write(crusherRestartFrame, sizeof(crusherRestartFrame));
        lcd.setCursor(0, 1);
        lcd.print("Crusher:" + crusherStatus + "      ");
      }
      else if (receivedData == "SS") {
        digitalWrite(7, HIGH);
        // digitalWrite(8, HIGH);
        screenStatus = "Off";
        XBeeSerial.write(screenStoppedFrame, sizeof(screenStoppedFrame));
        lcd.setCursor(0, 2);
        lcd.print("Screen:" + screenStatus + "      ");
        digitalWrite(10,HIGH);
        delay(2000);
        digitalWrite(10,LOW);
      }
      else if (receivedData == "SR") {
        digitalWrite(7, LOW);
        // digitalWrite(8, LOW);
        screenStatus = "On";
        XBeeSerial.write(screenRestartFrame, sizeof(screenRestartFrame));
        lcd.setCursor(0, 2);
        lcd.print("Screen:" + screenStatus + "      ");
      }
    }
    else if (xbee.getResponse().getApiId() == MODEM_STATUS_RESPONSE) {
      xbee.getResponse().getModemStatusResponse(msr);
      Serial.print("Modem status: ");
      Serial.println(msr.getStatus(), HEX);
    }
    else {
      Serial.println("Other API frame received.");
    }
  }
  else if (xbee.getResponse().isError()) {
    Serial.print("Error reading packet. Error code: ");
    Serial.println(xbee.getResponse().getErrorCode());
  }
}


