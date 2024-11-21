#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

// Configuración WiFi
const char *ssid = "PRUEBA";
const char *password = "12345678";

// Configuración de Supabase
const char *supabaseUrl = "https://gfhnevphfwfrvfonorep.supabase.co/rest/v1/Registro_consumo";
const char *supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmaG5ldnBoZndmcnZmb25vcmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MTk4NTgsImV4cCI6MjA0NTk5NTg1OH0.grwTsD5wH0auQ0UHkeuYAIoSvZCZ-_ppmzEpC2kC4w8";

// Configuración del sensor ACS712
#define ACS712_PIN 34                   // Pin 13 para el sensor ACS712
#define SENSITIVITY 0.066               // Sensibilidad del sensor (para modelo 30A)
const int ADC_RESOLUTION = 4095;        // Resolución del ADC
const float V_REF = 3.3;                // Voltaje de referencia del ESP32
float ZERO_CURRENT_VOLTAGE = V_REF / 2; // Voltaje de reposo inicial (calibrar después)
const float LOAD_VOLTAGE = 110.0;       // Voltaje aplicado a la carga

// ID del electrodoméstico
const int idElectrodomestico = 8; // Cambiar según el electrodoméstico

void setup()
{
    Serial.begin(115200);
    analogReadResolution(12);
    Serial.println("Iniciando calibración...");

    // Calibrar el voltaje en reposo
    ZERO_CURRENT_VOLTAGE = calibrarSensor();
    Serial.print("Voltaje en reposo calibrado: ");
    Serial.println(ZERO_CURRENT_VOLTAGE, 3);

    // Conexión WiFi
    Serial.println("Conectando a WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Intentando conexión...");
    }
    Serial.println("WiFi conectado.");

    // Configuración de la hora usando NTP
    configTime(0, 0, "pool.ntp.org", "time.nist.gov"); // Usar servidores NTP para sincronización
    Serial.println("Sincronizando la hora...");
    delay(2000); // Esperar para sincronización con NTP
}

void loop()
{
    // Leer y calcular valores del sensor
    float averageVoltage = 0;
    for (int i = 0; i < 10; i++)
    {
        averageVoltage += analogRead(ACS712_PIN);
        delay(10);
    }
    averageVoltage /= 10; // Promedio de las lecturas
    float voltage = (averageVoltage * V_REF) / ADC_RESOLUTION;

    // Verificar que el voltaje esté dentro de un rango razonable
    if (voltage < 0 || voltage > V_REF)
    {
        Serial.println("Valor de voltaje fuera de rango. Reajustando lectura...");
        return;
    }

    // Calcular corriente
    float current = (voltage - ZERO_CURRENT_VOLTAGE) / SENSITIVITY;
    if (current < 0)
        current = 0; // Evitar valores negativos

    // Calcular potencia
    float power = LOAD_VOLTAGE * current;
    if (power < 0)
        power = 0; // Evitar valores negativos de potencia

    // Mostrar resultados en el monitor serial
    Serial.print("Voltaje aplicado: ");
    Serial.print(LOAD_VOLTAGE, 1);
    Serial.print(" V | Corriente: ");
    Serial.print(current, 3);
    Serial.print(" A | Potencia: ");
    Serial.print(power, 2);
    Serial.println(" W");

    // Si la potencia es mayor que 0, se envía a la base de datos
    if (power > 0.01)
    { // Validar que la potencia sea significativa (mayor a un valor pequeño)
        // Obtener la fecha y hora actual del sistema
        time_t now;
        struct tm timeInfo;
        time(&now);                   // Obtener el tiempo actual
        localtime_r(&now, &timeInfo); // Obtener hora local

        char isoTime[25];
        strftime(isoTime, sizeof(isoTime), "%Y-%m-%dT%H:%M:%SZ", &timeInfo); // Formato ISO 8601

        // Enviar datos a Supabase
        if (WiFi.status() == WL_CONNECTED)
        {
            HTTPClient http;
            http.begin(supabaseUrl);
            http.addHeader("Content-Type", "application/json");
            http.addHeader("apikey", supabaseKey); // Cambiar encabezado de autorización

            String payload = "{";
            payload += "\"tiempo_consumo\": \"" + String(isoTime) + "\",";
            payload += "\"id_electrodomestico\": " + String(idElectrodomestico) + ",";
            payload += "\"consumo_energia\": " + String(power, 2);
            payload += "}";

            int httpResponseCode = http.POST(payload);

            if (httpResponseCode == 201)
            {
                Serial.println("Datos enviados a Supabase con éxito.");
            }
            else
            {
                Serial.print("Error al enviar datos: ");
                Serial.println(httpResponseCode);
                Serial.println(http.getString());
            }
            http.end();
        }
        else
        {
            Serial.println("WiFi desconectado. Reintentando...");
        }
    }
    else
    {
        Serial.println("No hay consumo de energía significativo, no se enviarán datos.");
    }

    delay(120000); // Leer y enviar cada segundo
}

// Calibrar voltaje en reposo
float calibrarSensor()
{
    float sumVoltage = 0;
    for (int i = 0; i < 100; i++)
    {
        int rawValue = analogRead(ACS712_PIN);
        float voltage = (rawValue * V_REF) / ADC_RESOLUTION;
        sumVoltage += voltage;
        delay(10);
    }
    return sumVoltage / 100;
}