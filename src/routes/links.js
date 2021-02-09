const express = require('express');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

router.get('/add', isLoggedIn, (req,res)=>{
    res.render('links/add');
});

router.post('/add', isLoggedIn, async (req, res)=>{
    const { title, unidades, precio_costo, precio_venta, description} = req.body;
    
    const newLink= {
        title,
        url,
        unidades,
        precio_costo, 
        precio_venta,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO producto set ?', [newLink]);
    console.log(newLink);
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
var prueba = '';
router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const  venta = await pool.query('SELECT * FROM ventas WHERE id = ? limit 1', [id]);
   console.log("Ventas : ",venta);
   prueba = venta[0].title;
   res.render('links/edit', {link: venta[0]});                                                
});

router.post('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    // console.log(title.req.params);
    const {title, url,unidades, Precio_costo, Precio_venta, description} = req.body;
     console.log(title);
    const newLink = {
        title,
        url,
        unidades,
        Precio_costo,
         Precio_venta,
        description
    };
    console.log(prueba);
    console.log(newLink.title);
   await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
   req.flash('success', 'se ha actualizado correctamente');
   res.redirect('/links');
});
module.exports = router;