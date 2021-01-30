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
    await pool.query('INSERT INTO Links set ?', [newLink]);
    console.log(newLink);
    req.flash('success', 'guardado correctamente');
    res.redirect('/links');
});




router.get('/', isLoggedIn, async(req, res)=>{
    const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    console.log(links);
    res.render('links/list', {links});
});

router.get('/allLinks', isLoggedIn, async(req, res)=>{
    const links = await pool.query('SELECT * FROM links');
    console.log(links);
    res.render('links/list', {links});
});

router.get('/delete/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
 await pool.query('DELETE FROM links WHERE ID = ?', [id]);
 req.flash('success', 'Se ha eliminado correctamente');
res.redirect('/links');

});
var prueba = '';
router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
   console.log(links[0]);
   prueba = links[0].title;
   res.render('links/edit', {link: links[0]});                                                
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