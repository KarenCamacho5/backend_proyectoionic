const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Datos de usuarios para login
const users = [{ email: "karencamacho484@gmail.com", password: "1234" }];

router.post('/', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Credenciales incorrectas' });
    }
});

module.exports = router;
