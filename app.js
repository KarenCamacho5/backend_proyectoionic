const express = require('express');
const cors = require('cors');
const app = express();
const loginRoute = require('./routes/login'); 
const productsRoute = require('./routes/products'); 

const corsOptions = {
    origin: ['http://localhost', 'http://localhost:8100', 'https://proyectoionic.onrender.com'], // Orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true,
  };
  
  app.use(cors(corsOptions));

// Middleware para manejar JSON
app.use(express.json());


// Rutas
app.use('/api/login', loginRoute);
app.use('/api', productsRoute);

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
