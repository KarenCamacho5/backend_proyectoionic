const express = require('express');
const cors = require('cors');
const app = express();
const loginRoute = require('./routes/login'); 
const productsRoute = require('./routes/products'); 

app.use(cors({
    origin: ['http://localhost:4200', 'https://proyectoionic.onrender.com', 'http://localhost:3000'], 
    credentials: true
}));

// Middleware para manejar JSON
app.use(express.json());


// Rutas
app.use('/api/login', loginRoute);
app.use('/api/products', productsRoute);

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
