// Configuración de ThingSpeak
const channelId = "2822645";
const apiKey = "4ACUG07EDP8NQRKK";

let phChart, temperaturaChart, distanciaChart, turbidezChart, caudalChart;

// Función para obtener datos de ThingSpeak
async function fetchThingSpeakData() {
    try {
        console.log('Intentando obtener datos de ThingSpeak...');
        const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=20`;
        console.log('URL de la petición:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (!data.feeds || data.feeds.length === 0) {
            throw new Error('No se recibieron datos de ThingSpeak');
        }
        
        return data.feeds;
    } catch (error) {
        console.error('Error al obtener datos de ThingSpeak:', error);
        showError(`Error: ${error.message}. Por favor, revisa la consola para más detalles.`);
        throw error;
    }
}

// Función para inicializar los gráficos
function initializeCharts() {
    const chartConfigs = [
        { id: "phChart", label: "PH", color: "rgba(255, 99, 132, 0.5)" },
        { id: "temperaturaChart", label: "Temperatura", color: "rgba(54, 162, 235, 0.5)" },
        { id: "distanciaChart", label: "Distancia", color: "rgba(255, 206, 86, 0.5)" },
        { id: "turbidezChart", label: "Turbidez", color: "rgba(75, 192, 192, 0.5)" },
        { id: "caudalChart", label: "Caudal", color: "rgba(153, 102, 255, 0.5)" },
    ];

    chartConfigs.forEach((config) => {
        const ctx = document.getElementById(config.id);
        if (!ctx) {
            console.error(`No se encontró el elemento ${config.id}`);
            return;
        }
        new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: config.label,
                    data: [],
                    borderColor: config.color,
                    backgroundColor: config.color.replace("0.5", "0.1"),
                    fill: true,
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: false,
                elements: {
                    line: {
                        tension: 0.3
                    }
                }
            },
        });
    });

    // Asignar los gráficos a variables globales
    phChart = Chart.getChart("phChart");
    temperaturaChart = Chart.getChart("temperaturaChart");
    distanciaChart = Chart.getChart("distanciaChart");
    turbidezChart = Chart.getChart("turbidezChart");
    caudalChart = Chart.getChart("caudalChart");

    console.log('Gráficos inicializados exitosamente');
}

// Función para actualizar los gráficos
function updateCharts(data) {
    console.log('Actualizando gráficos con nuevos datos:', data);

    try {
        const timeLabels = data.map(feed => new Date(feed.created_at).toLocaleTimeString());
        const charts = [phChart, temperaturaChart, distanciaChart, turbidezChart, caudalChart];
        const fields = ["field1", "field2", "field3", "field4", "field5"];

        charts.forEach((chart, index) => {
            if (chart) {
                chart.data.labels = timeLabels;
                chart.data.datasets[0].data = data.map(feed => parseFloat(feed[fields[index]]));
                chart.update();
            } else {
                console.error(`El gráfico ${fields[index]} no está inicializado`);
            }
        });

        console.log('Gráficos actualizados exitosamente');
    } catch (error) {
        console.error('Error al actualizar los gráficos:', error);
        showError(`Error al actualizar los gráficos: ${error.message}`);
    }
}

// Función principal para actualizar datos
async function updateData() {
    try {
        updateStatus("Obteniendo datos...");
        const data = await fetchThingSpeakData();
        updateCharts(data);
        const now = new Date().toLocaleString();
        document.getElementById("lastUpdate").textContent = now;
        updateStatus("Conectado");
        document.getElementById("error-message").style.display = "none";
    } catch (error) {
        console.error("Error en updateData:", error);
        updateStatus("Error de conexión");
        showError(`Error al actualizar los datos: ${error.message}`);
    }
}

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

// Función para actualizar el estado
function updateStatus(status) {
    document.getElementById("connection-status").textContent = status;
}

// Inicializar y actualizar periódicamente
window.addEventListener("load", () => {
    initializeCharts();
    updateData();
    setInterval(updateData, 15000); // Actualizar cada 15 segundos
});