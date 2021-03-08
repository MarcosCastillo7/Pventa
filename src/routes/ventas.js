const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/factura', isLoggedIn, async (req, res) => {
    res.render('ventas/factura');
})

router.post('/factura', isLoggedIn, async (req, res) => {
    let { cliente, nit, total, detalle } = req.body;

    if(detalle.length===0){
        req.flash("Datos vacios");
        res.json("false");
    }


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
    res.json(productos);
})

router.get('/', isLoggedIn, async (req, res) => {
    // const ventas = await pool.query('select * from ventas order by created_at desc');
    const ventas = await pool.query('select * from ventas where MONTH(created_at)=MONTH(CURDATE()) order by created_at desc');
    const response= await pool.query('select sum(total) as total from ventas where MONTH(created_at)=MONTH(CURDATE()) ');

    // res.render('ventas/ListVentas', { ventas,'total': response[0].total});
    res.render('ventas/ListVentas', { ventas,'total': response[0].total.toFixed(2)});
});

router.get('/:id',isLoggedIn, async(req,res)=>{
    const detalle= await pool.query('Select * from detalle where venta_id=?',req.params.id);
    res.render('ventas/detalle',{detalle});
});

router.get('/delete/:id',isLoggedIn, async(req,res)=>{
    await pool.query('Delete from detalle where venta_id=?',req.params.id);
   await pool.query('Delete from ventas where id=?',req.params.id);

    res.redirect('/ventas');
})

module.exports = router