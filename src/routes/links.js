const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/p/add', isLoggedIn, (req, res) => {
    res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res) => {
    
    const { title, unidades, precio_costo, precio_venta, description } = req.body;

    let comparar = await pool.query('SELECT * FROM producto WHERE title =?', title);

    if (comparar.length > 0) {
        req.flash('message', 'Ese producto ya existe');
        res.redirect('/links/p/add');
    }
    else {
        let p_venta = parseFloat(precio_venta).toFixed(2);
        let p_costo = parseFloat(precio_costo).toFixed(2);
        const newLink = {
            title,
            unidades,
            precio_costo: p_costo,
            precio_venta: p_venta,
            description,
            user_id: req.user.id
        };

        await pool.query('INSERT INTO producto set ? ', [newLink]);

        var prod = await pool.query('SELECT MAX(id) AS id FROM producto');
        var a = JSON.stringify(prod);
        var regex = /(\d+)/g;
        var b = a.match(regex);
        var d = JSON.stringify(b);
        var id_producto = d.replace(/['"+[\]]+/g, '');
        var registro = {
            id_producto,
            existencia: unidades,
            ingreso: 0,
            egreso: 0,
            usuario: req.user.username
        };
        await pool.query('INSERT INTO registro_producto set ? ', [registro]);
        req.flash('success', 'guardado correctamente');
        res.redirect('/links');
    }
});

router.get('/', isLoggedIn, async (req, res) => {
    let links = await pool.query('SELECT * FROM producto');
    var prod = [];

    for (var i = 0; i < links.length; i++) {
        prod.push({
            num: i + 1,
            id: links[i].id,
            title: links[i].title,
            unidades: links[i].unidades,
            precio_costo: links[i].precio_costo,
            precio_venta: links[i].precio_venta,
            description: links[i].description,
            user_id: links[i].user_id,
            created_at: links[i].created_at
        });
    }
    res.render('links/list', { prod });
});


router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM producto WHERE ID = ?', [id]);
    /* Eliminar el producto y enviar la respuesta a la peticion  del sweetAlert */
    res.json('Eliminado con exito');
});

var bd = '';
var costo = '';
var egreso = '';


router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);

    costo = links[0].precio_costo;
    res.render('links/edit', { link: links[0] });
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    var { title, unidades, precio_costo, precio_venta, description } = req.body;

    let p_venta = parseFloat(precio_venta).toFixed(2);
    let p_costo = parseFloat(precio_costo).toFixed(2);

    const newLink = {
        id,
        title,
        unidades,
        precio_costo: p_costo,
        precio_venta: p_venta,
        description
    };

    await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'se ha actualizado correctamente');
    res.redirect('/links');
});

router.get('/ingreso/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
    bd = links[0].unidades;
    costo = links[0].precio_costo;
    egreso = links[0].precio_venta;
    res.render('links/ingreso', { link: links[0] });
});


router.post('/ingreso/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    var { title, unidades } = req.body;

    let suma = 0;
    var a = parseInt(unidades, 10);
    var b = parseInt(bd, 10);
    var c = (a + b).toString();
    if (unidades === '') {
        suma = suma + b;
        unidades = suma.toString();
    }
    else {
        unidades = c;
        var registro = {
            id_producto: id,
            existencia: unidades,
            ingreso: a,
            egreso: 0,
            usuario: req.user.username
        };
        await pool.query('INSERT INTO registro_producto set ? ', [registro]);

    }

    const newLink = {
        title,
        unidades,
    };


    await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'se ha actualizado correctamente');
    res.redirect('/links');

});


router.get('/egreso/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
    //    console.log(links[0]);
    bd = links[0].unidades;
    costo = links[0].precio_costo;
    //    egreso = links[0].Precio_venta;
    res.render('links/egreso', { link: links[0] });
});


router.post('/egreso/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    var { title, unidades } = req.body;
    
    let suma = 0;
    var b = parseInt(bd, 10);
    if (unidades === '') {
        suma = suma + b;
        unidades = suma.toString();
    }
    else {
        var a = parseInt(unidades, 10);
        var c = (b - a).toString();
        if (c < 0) {
            req.flash('message', 'Solo hay', b, 'unidades en existencia');
            unidades = b.toString();
        }
        else {
            unidades = c;
            var registro = {
                id_producto: id,
                existencia: unidades,
                ingreso: 0,
                egreso: a,
                usuario: req.user.username
            };
            await pool.query('INSERT INTO registro_producto set ? ', [registro]);
            req.flash('success', 'se ha actualizado correctamente');
        }
    }

    const newLink = {
        title,
        unidades,
    };

    await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);

    res.redirect('/links');
});

router.get('/registro/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
    console.log(links[0]);
    const registros = await pool.query('SELECT * FROM registro_producto WHERE id_producto = ?', [id]);
    res.render('links/registro', { registros, link: links[0] });
});

router.get('/detalles_p/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;   
    const prod =await pool.query('SELECT * FROM producto WHERE ID = ?', [id]);
    res.render('links/detalles_p', {link: prod[0]});  

});

module.exports = router;