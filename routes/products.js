const express = require('express');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const axios = require('axios');
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

router.get('/productos', authenticateToken, async (req, res) => {
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
router.get('/reporte-pdf', async (req, res) => {
    const doc = new PDFDocument();
  
    // Configura la respuesta para descargar el PDF
    res.setHeader('Content-Disposition', 'attachment; filename="productos.pdf"');
    doc.pipe(res);
  
    // Encabezado del PDF
    doc.fontSize(18).text('Lista de Productos', { align: 'center' });
    doc.moveDown();
  
    try {
      const response = await axios.get('https://peticiones.online/api/products');
      const products = response.data;
  
      if (products.results && products.results.length > 0) {
        for (const [index, item] of products.results.entries()) {
          // Añade la imagen del producto
          if (item.image) {
            try {
              const imageResponse = await axios.get(item.image, { responseType: 'arraybuffer' });
              const imageBuffer = Buffer.from(imageResponse.data, 'base64');
              doc.image(imageBuffer, {
                fit: [150, 150], // Tamaño de la imagen
                align: 'center',
              });
              doc.moveDown(0.5); // Espacio después de la imagen
            } catch (error) {
              console.error(`No se pudo cargar la imagen para ${item.name}`, error);
              doc.text('   [Imagen no disponible]');
              doc.moveDown(1); // Espacio después del texto alternativo
            }
          }
  
          // Añade los detalles del producto
          doc.fontSize(12).text(`${index + 1}. ${item.name}`, { continued: false });
          doc.text(`   Descripción: ${item.description}`);
          doc.text(`   Categoría: ${item.category}`);
          doc.text(`   Precio: $${item.price}`);
          doc.text(`   Activo: ${item.active ? 'Sí' : 'No'}`);
          doc.moveDown(1); // Espacio entre productos
        }
      } else {
        doc.fontSize(12).text('No hay productos disponibles.', { align: 'center' });
      }
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      doc.fontSize(12).text('Error al obtener los productos. Inténtalo más tarde.', { align: 'center' });
    }
  
    doc.end();
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
