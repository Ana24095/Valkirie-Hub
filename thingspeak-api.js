// Configuración de ThingSpeak
const channelId = "2822645"
const apiKey = "4ACUG07EDP8NQRKK"

// Función para obtener datos de ThingSpeak
async function fetchThingSpeakData() {
  try {
    console.log("Intentando obtener datos de ThingSpeak...")
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=20`
    console.log("URL de la petición:", url)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log("Datos recibidos:", data)

    if (!data.feeds || data.feeds.length === 0) {
      throw new Error("No se recibieron datos de ThingSpeak")
    }

    return data.feeds
  } catch (error) {
    console.error("Error al obtener datos de ThingSpeak:", error)
    document.getElementById("error-message").textContent =
      `Error: ${error.message}. Por favor, revisa la consola para más detalles.`
    throw error
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
  ]

  chartConfigs.forEach((config) => {
    const ctx = document.getElementById(config.id).getContext("2d")
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: config.label,
            data: [],
            backgroundColor: config.color,
            borderColor: config.color,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  })
}

// Función para actualizar los gráficos
function updateCharts(data) {
  const charts = ["phChart", "temperaturaChart", "distanciaChart", "turbidezChart", "caudalChart"]
  const fields = ["field1", "field2", "field3", "field4", "field5"]

  charts.forEach((chartId, index) => {
    const chart = Chart.getChart(chartId)
    const fieldData = data.map((feed) => ({
      x: new Date(feed.created_at),
      y: Number.parseFloat(feed[fields[index]]),
    }))

    chart.data.datasets[0].data = fieldData
    chart.update()
  })
}

// Función principal para actualizar datos
async function updateData() {
  try {
    updateStatus("Obteniendo datos...")
    const data = await fetchThingSpeakData()
    updateCharts(data)
    const now = new Date().toLocaleString()
    document.getElementById("lastUpdate").textContent = now
    updateStatus("Conectado")
    document.getElementById("error-message").style.display = "none"
  } catch (error) {
    console.error("Error en updateData:", error)
    updateStatus("Error de conexión")
    showError(`Error al actualizar los datos: ${error.message}`)
  }
}

// Función para mostrar errores
function showError(message) {
  const errorDiv = document.getElementById("error-message")
  errorDiv.textContent = message
  errorDiv.style.display = "block"
}

// Función para actualizar el estado
function updateStatus(status) {
  document.getElementById("connection-status").textContent = status
}

// Inicializar y actualizar periódicamente
window.addEventListener("load", () => {
  initializeCharts()
  updateData()
  setInterval(updateData, 15000) // Actualizar cada 15 segundos
})

