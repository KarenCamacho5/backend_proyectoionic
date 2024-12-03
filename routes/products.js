const express = require('express');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
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


// Ruta para generar PDF
router.get('/reporte/pdf', authenticateToken, async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://peticiones.online/api/products');
        const products = await response.json();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="productos.pdf"');
        doc.pipe(res);

        // Contenido del PDF
        doc.fontSize(20).text('Reporte de Productos', { align: 'center' });
        doc.moveDown();

        products.data.forEach((product, index) => {
            doc.fontSize(12).text(`${index + 1}. ${product.name} - $${product.price}`);
        });

        // Finalizar el documento
        doc.end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el PDF' });
    }
});


// Ruta para generar Excel
router.get('/reporte/excel', authenticateToken, async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://peticiones.online/api/products');
        const products = await response.json();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');

        // Definir columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nombre', key: 'name', width: 30 },
            { header: 'Precio', key: 'price', width: 15 },
        ];

        // Agregar filas
        products.data.forEach((product) => {
            worksheet.addRow({
                id: product.id,
                name: product.name,
                price: product.price,
            });
        });

        // Configurar encabezados de respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="productos.xlsx"');

        // Enviar archivo
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Error al generar el Excel' });
    }
});


module.exports = router;
