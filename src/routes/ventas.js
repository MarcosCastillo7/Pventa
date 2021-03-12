const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/factura', isLoggedIn, async (req, res) => {
    res.render('ventas/factura');
})

router.post('/factura', isLoggedIn, async (req, res) => {
    let { cliente, nit, total, detalle } = req.body;

    console.log(detalle);

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
            let { id_producto } = element;

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
    let mes = await ventasMes(null);
    res.render('ventas/ListVentas', { 'ventas': mes.ventas, 'total': mes.total, 'fecha': mes.date });
})

router.post('/', isLoggedIn, async (req, res) => {
    let { date } = req.body;

    objeto = {
        mes: parseInt(date.slice(-2)),
        anio: parseInt(date.slice(0, 4))
    }
    let mes = await ventasMes(objeto);

    res.render('ventas/ListVentas', { 'ventas': mes.ventas, 'total': mes.total, 'fecha': mes.date })
})

router.get('/:id', isLoggedIn, async (req, res) => {
    const detalle = await detalleVenta(req.params.id);
    res.render('ventas/detalle', { detalle });
})

let ventasMes = async (date = null) => {

    if (date === null) {
        var f = new Date();
        console.log(f)
        date = {
            mes: f.getMonth() + 1,
            anio: f.getFullYear()
        }
    }

    const ventas = await pool.query(`select * from ventas where MONTH(created_at)=${date.mes} and YEAR(created_at)=${date.anio}  order by created_at desc`);
    const response = await pool.query(`select sum(total) as total from ventas where MONTH(created_at)= ${date.mes} and YEAR(created_at)= ${date.anio} order by total`);

    if (response[0].total === null) {
        response[0].total = 0;
    }

    totalMes = {
        ventas,
        total: response[0].total.toFixed(2),
        date: date.anio + '-' + ('0' + date.mes).slice(-2)
    }

    return totalMes
}

let detalleVenta = async (id) => {
    return await pool.query('Select * from detalle where venta_id=?', id);
}


//EN proceso :V
/* router.get('/imprimir/listado/:date', async (req, res) => {
    const date = req.params.date;

    objeto = {
        mes: parseInt(date.slice(-2)),
        anio: parseInt(date.slice(0, 4))
    }
    let mes = await ventasMes(objeto);

    for (let element of mes.ventas) {
        element.detalle = await detalleVenta(element.id);
    }


    
    res.render('ventas/imprimirlistado', mes);
}) */


module.exports = router