const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware para validar el token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).send("No token provided");
    
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).send("Token invalid");
        req.user = user;
        next();
    });
}

router.get('/', authenticateToken, async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://peticiones.online/api/products'); // URL de la API de productos
        const products = await response.json();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

module.exports = router;
