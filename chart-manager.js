let temperaturaChart, humedadChart, movimientoChart;

function createCharts(data) {
    console.log('Creando gráficos con datos:', data);

    const commonOptions = {
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
    };

    try {
        // creaeción de los graficos esto lo edutan segun las necesidades de su proyecto 
        const ctxTemp = document.getElementById('temperaturaChart');
        if (!ctxTemp) {
            throw new Error('No se encontró el elemento temperaturaChart');
        }
        temperaturaChart = new Chart(ctxTemp, {
            type: 'line',
            data: {
                labels: data.map(feed => new Date(feed.created_at).toLocaleTimeString()),   // AQUI EMPIEZA LA PARTE DEL DISEÑO, TAMBIEN L0 PUEDEN EDITAR 
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: data.map(feed => feed.field1),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true
                }]
            },
            options: commonOptions
        });

        // Crear gráfico de humedad
        const ctxHum = document.getElementById('humedadChart');
        if (!ctxHum) {
            throw new Error('No se encontró el elemento humedadChart');
        }
        humedadChart = new Chart(ctxHum, {
            type: 'line',
            data: {
                labels: data.map(feed => new Date(feed.created_at).toLocaleTimeString()),
                datasets: [{
                    label: 'Humedad (%)',
                    data: data.map(feed => feed.field2),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true
                }]
            },
            options: commonOptions
        });

        // Crear gráfico de movimiento 
        const ctxMov = document.getElementById('movimientoChart');
        if (!ctxMov) {
            throw new Error('No se encontró el elemento movimientoChart');
        }
        movimientoChart = new Chart(ctxMov, {
            type: 'line',
            data: {
                labels: data.map(feed => new Date(feed.created_at).toLocaleTimeString()),
                datasets: [{
                    label: 'Movimiento',
                    data: data.map(feed => feed.field3),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true
                }]
            },
            options: commonOptions
        });

        console.log('Gráficos creados exitosamente');
        //MANDARA ERROR SI LOS GRÁFICOS NO SE CREAN CORRECTAMENTE 
    } catch (error) {
        console.error('Error al crear los gráficos:', error);
        document.getElementById('error-message').textContent = 
            `Error al crear los gráficos: ${error.message}`;
    }
}

function updateCharts(data) {
    console.log('Actualizando gráficos con nuevos datos:', data);

    try {
        if (!temperaturaChart || !humedadChart || !movimientoChart) {
            console.log('Los gráficos no existen, creándolos...');
            createCharts(data);
        } else {
            const timeLabels = data.map(feed => new Date(feed.created_at).toLocaleTimeString());
            
            temperaturaChart.data.labels = timeLabels;
            temperaturaChart.data.datasets[0].data = data.map(feed => feed.field1);
            temperaturaChart.update();

            humedadChart.data.labels = timeLabels;
            humedadChart.data.datasets[0].data = data.map(feed => feed.field2);
            humedadChart.update();

            movimientoChart.data.labels = timeLabels;
            movimientoChart.data.datasets[0].data = data.map(feed => feed.field3);
            movimientoChart.update();

            console.log('Gráficos actualizados exitosamente');
        }
    } catch (error) {
        console.error('Error al actualizar los gráficos:', error);
        document.getElementById('error-message').textContent = 
            `Error al actualizar los gráficos: ${error.message}`;
    }
}