const express = require('express');
const cors = require('cors');
const app = express();
const loginRoute = require('./routes/login'); 
const productsRoute = require('./routes/products'); 

app.use(cors());

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
