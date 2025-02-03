#include <WiFi.h>
#include <ThingSpeak.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi
const char* ssid = "Flia Pitty López 2.4Ghz";
const char* password = "IsMa010569.";

// Configuración de ThingSpeak
unsigned long channelID = 2822645;
const char* writeAPIKey = "4ACUG07EDP8NQRKK";


#define PH_PIN 34           //  pH
#define TRIG_PIN 13         // TRIG del HC-SR04
#define ECHO_PIN 12         // ECHO del HC-SR04
#define FLOW_SENSOR_PIN 27  //  sensor de flujo
#define TURBIDITY_PIN 35    //  turbidez
#define ONE_WIRE_BUS 2      //  del DS18B20

WiFiClient client;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Variables 
volatile int pulseCount = 0;
float flowRate = 0.0;
unsigned long oldTime = 0;

// Interrupción para el sensor de flujo
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);

  // Conexión a Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado");
  ThingSpeak.begin(client);

  // Inicialización de sensores
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  sensors.begin();
}

void loop() {
  // Leer valores de sensores
  float phValue = readPH();
  float temperature = readTemperature();
  float distance = readDistance();
  float turbidity = readTurbidity();
  flowRate = readFlowRate();

  //Datos en el monitor serie
  Serial.println("==== Datos de los sensores ====");
  Serial.printf("pH: %.2f\n", phValue);
  Serial.printf("Temperatura: %.2f°C\n", temperature);
  Serial.printf("Distancia: %.2f cm\n", distance);
  Serial.printf("Turbidez: %.2f NTU\n", turbidity);
  Serial.printf("Flujo de agua: %.2f L/min\n", flowRate);

  //Datos a ThingSpeak
  ThingSpeak.setField(1, phValue);
  ThingSpeak.setField(2, temperature);
  ThingSpeak.setField(3, distance);
  ThingSpeak.setField(4, turbidity);
  ThingSpeak.setField(5, flowRate);

  int responseCode = ThingSpeak.writeFields(channelID, writeAPIKey);
  if (responseCode == 200) {
    Serial.println("Datos enviados correctamente a ThingSpeak");
  } else {
    Serial.printf("Error al enviar datos: %d\n", responseCode);
  }

  // Esperar 15 segundos
  delay(15000);
}

//leer sensores
float readPH() {
  int sensorValue = analogRead(PH_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float ph = 7 + ((2.5 - voltage) / 0.18); // Calibración básica
  return ph;
}

float readTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}

float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = (duration * 0.0343) / 2;
  return distance;
}

float readTurbidity() {
  int sensorValue = analogRead(TURBIDITY_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float turbidity = 3000 - (1000 * voltage); 
  return turbidity;
}

float readFlowRate() {
  unsigned long currentTime = millis();
  unsigned long elapsedTime = currentTime - oldTime;

  float flowRate = (pulseCount / 7.5) / (elapsedTime / 1000.0); 
  pulseCount = 0;
  oldTime = currentTime;
  return flowRate;
}
