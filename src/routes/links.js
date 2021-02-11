const { json } = require('express');
const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

router.get('/add', isLoggedIn, (req,res)=>{
    res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res)=>{

    const { title, url, unidades, Precio_costo, Precio_venta, description} = req.body;
    const newLink= {
        title,
        url,
        unidades,
        Precio_costo, 
        Precio_venta,
        description,
        user_id: req.user.id
    };
      await pool.query('INSERT INTO producto set ? ', [newLink]);
      var prod =await pool.query('SELECT last_insert_id()');
    var a= JSON.stringify(prod);
    var regex = /(\d+)/g;
    var b  = a.match(regex);
     var d= JSON.stringify(b);
     var id_producto= d.replace(/['"+[\]]+/g,'');
        var registro = {
            id_producto,
            existencia:unidades,
            edicion: 0,
            ingreso:0,
            egreso: 0,
            usuario: req.user.username
        };

await pool.query('INSERT INTO registro_producto set ? ', [registro]);
    req.flash('success', 'guardado correctamente');
    res.redirect('/links');
    
});




router.get('/', isLoggedIn, async(req, res)=>{
    const links = await pool.query('SELECT * FROM producto WHERE user_id = ?', [req.user.id]);
    console.log(links);
    res.render('links/list', {links});
});

router.get('/allLinks', isLoggedIn, async(req, res)=>{
    const links = await pool.query('SELECT * FROM producto');
    console.log(links);
    res.render('links/list', {links});
});

router.get('/delete/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
 await pool.query('DELETE FROM producto WHERE ID = ?', [id]);
 req.flash('success', 'Se ha eliminado correctamente');
res.redirect('/links');

});

var bd = '';
var costo = '';
var egreso= '';


router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    console.log(typeof id);
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
   console.log(links[0]);
   costo = links[0].Precio_costo;
   res.render('links/edit', {link: links[0]});                                                
});


router.post('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    // console.log(title.req.params);
    var {title, url,unidades, Precio_costo, Precio_venta, description} = req.body;
    //  console.log(id);
    console.log(costo);
    const newLink = {
        title,
        url,
        unidades,
        Precio_costo,
         Precio_venta,
        description
    };
        var registro = {
            id_producto:id,
            existencia:unidades,
            edicion: unidades,
            ingreso:0,
            egreso:0,
            usuario: req.user.username
        };

   await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);  
await pool.query('INSERT INTO registro_producto set ? ', [registro]);
   req.flash('success', 'se ha actualizado correctamente');
   res.redirect('/links');
});

router.get('/ingreso/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
//    console.log(links[0]);
   bd = links[0].unidades;
   costo = links[0].Precio_costo;
   egreso = links[0].Precio_venta;
   res.render('links/ingreso', {link: links[0]});                                                
});


router.post('/ingreso/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    // console.log(title.req.params);
    var {title, url,unidades, Precio_costo, Precio_venta, description} = req.body;
    //  console.log(title);
   let suma=0;
    var a = parseInt(unidades,10);
    var b = parseInt(bd,10);
    var c = (a+b).toString();
    if(unidades=== ''){
     suma=suma+b;
     unidades=suma.toString();
    }
    else{
        unidades=c;
        var registro = {
            id_producto:id,
            existencia:unidades,
            edicion: 0,
            ingreso:a,
            egreso:0,
            usuario: req.user.username
        };
await pool.query('INSERT INTO registro_producto set ? ', [registro]);

    }

    console.log(bd);
    // const unidades=  parseInt(cantidad,10);
    // unidades = cantidad + unidades;
 
    const newLink = {
        title,
        url,
        unidades,
        Precio_costo,
         Precio_venta,
        description
    };
    console.log(typeof suma);
    // console.log(newLink.title);
   await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);
   req.flash('success', 'se ha actualizado correctamente');
   res.redirect('/links');
});


router.get('/egreso/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
//    console.log(links[0]);
   bd = links[0].unidades;
   costo = links[0].Precio_costo;
//    egreso = links[0].Precio_venta;
   res.render('links/egreso', {link: links[0]});                                                
});


router.post('/egreso/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    var {title, url,unidades, Precio_costo, Precio_venta, description} = req.body;
    //  console.log(title);
    let suma=0;
    var b = parseInt(bd,10);
    if(unidades=== ''){
     suma=suma+b;
     unidades=suma.toString();
            }
    else{
        var a = parseInt(unidades,10);
    var c = (b-a).toString();
            if(c<0){ 
    req.flash('message', 'Solo hay', b, 'unidades en existencia');
         unidades=b.toString();
            }
            else{
                unidades=c;
                var registro = {
                    id_producto:id,
                    existencia:unidades,
                    edicion: 0,
                    ingreso:0,
                    egreso:a,
                    usuario: req.user.username
                };
        await pool.query('INSERT INTO registro_producto set ? ', [registro]);
                req.flash('success', 'se ha actualizado correctamente');
            }
    }
    console.log(bd);

    const newLink = {
        title,
        url,
        unidades,
        Precio_costo,
         Precio_venta,
        description
    };
    console.log(typeof suma);
    // console.log(newLink.title);
   await pool.query('UPDATE producto set ? WHERE id = ?', [newLink, id]);
  
   res.redirect('/links');
});

router.get('/registro/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const links = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
   console.log(links[0]);
const registros = await pool.query('SELECT * FROM registro_producto WHERE id_producto = ?', [id]);
   res.render('links/registro', {registros,link: links[0]});                                                
});

module.exports = router;