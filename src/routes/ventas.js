const express = require('express');
const { route } = require('./links');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/factura', isLoggedIn, async (req, res) => {
    console.log("FACTURAS");
    res.render('ventas/factura');
})

router.post('/factura', isLoggedIn, async (req, res) => {
    let { cliente, nit, total, detalle } = req.body;

    const ventas = {
        user_id: req.user.id,
        cliente,
        nit,
        total
    }

    let respuesta = await pool.query('Insert INTO ventas set ?', ventas);

    await quitarProducto(detalle, respuesta.insertId);


    console.log("FINAL :V");

    req.flash('success', 'guardado correctamente');
    res.json('ok');
})

let quitarProducto = (detalle, idVenta) => {

    const promesas = detalle.map((element) => {
        return new Promise(async (resolve) => {
            let { id: id_producto } = element;

            delete element.id;
            element.venta_id = idVenta;

            let insertado = await pool.query('Insert into detalle set ?', element);

            console.log("insertado:", insertado);

            let producto = await pool.query('Select * from producto where id=?', id_producto);

            if (producto.length > 0) {
                producto[0].unidades -= element.cantidad;
                let actualizado = await pool.query('UPDATE producto set unidades=? where id=?', [producto[0].unidades, id_producto]);
                resolve("actualizado");
            }
        })
    })

    return new Promise(resolve => {
        Promise.all(promesas).then(() => {
            resolve("TErminado");
        })
    })
}

router.get('/productos', isLoggedIn, async (req, res) => {
    const productos = await pool.query('SELECT id, title, unidades, precio_venta,description FROM producto WHERE unidades>0');

    console.log("productos: ", productos);
    res.json(productos);
})

router.get('/venta', isLoggedIn, (req, res) => {
    res.render('ventas/venta');
});


router.post('/venta', isLoggedIn, async (req, res) => {

    const { cliente, cantidad, description } = req.body;

    const newLink = {
        cliente,
        cantidad,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO ventas set ?', [newLink]);
    // console.log(newLink);

    req.flash('success', 'guardado correctamente');
    res.redirect('/ventas');
});

var prueba = '';
router.get('/', isLoggedIn, async (req, res) => {
    const { cliente } = req.params;
    // const li= {
    //     title,
    //     url,
    //     user_id: req.user.id
    // }
    const ventas = await pool.query('SELECT * FROM ventas WHERE user_id = ?', [req.user.id]);
    // const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    const links = await pool.query('SELECT * FROM producto');
    // console.log(ventas);
    // prueba = links[0];
    const unir = { ...ventas, ...links };
    // const b= Object.assign(ventas,links);
    // ventas[1][1] =links[0];

    console.log(unir);
    res.render('ventas/ListVentas', { links, ventas });
});


module.exports = router;
