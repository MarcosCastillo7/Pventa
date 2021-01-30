const express = require('express');
const { route } = require('./links');
const router = express.Router();

const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');

// const a = {title,url} = require('./links');
// console.log(a);
// // router.get('/venta', isLoggedIn, (req,res)=>{
// //     res.render('ventas/venta');
// // });

// // router.post('/venta', isLoggedIn, async (req, res)=>{
// //     const { title, url, cantidad, description} = req.body;
    
// //     const newLink= {
// //         title,
// //         url,
// //         cantidad,
// //         description,
// //         user_id: req.user.id
// //     };
// //     await pool.query('INSERT INTO ventas set ?', [newLink]);
// //     console.log(newLink);
// //     req.flash('success', 'guardado correctamente');
// //     res.redirect('/ventas');
// // });

router.get('/venta', isLoggedIn, (req,res)=>{
    res.render('ventas/venta');
});


router.post('/venta', isLoggedIn, async (req, res)=>{
   
    const { cliente, cantidad, description} = req.body;
    
    const newLink= {
        cliente,
        cantidad,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO ventas1 set ?', [newLink]);
    // console.log(newLink);
  
    req.flash('success', 'guardado correctamente');
    res.redirect('/ventas');
});

// router.get('/RVentas', isLoggedIn, async(req, res)=>{
//     const links = await pool.query('SELECT * FROM ventas WHERE user_id = ?', [req.user.id]);
//     console.log(links);
//     res.render('ventas/ListVentas', {links});
// });

var prueba = '';
router.get('/', isLoggedIn, async(req, res)=>{
    const{cliente}= req.params;
    // const li= {
    //     title,
    //     url,
    //     user_id: req.user.id
    // }
    const ventas = await pool.query('SELECT * FROM ventas1 WHERE user_id = ?', [req.user.id]);
    // const links = await pool.query('SELECT * FROM links WHERE user_id = ?', [req.user.id]);
    const links = await pool.query('SELECT * FROM links');
    // console.log(ventas);
    // prueba = links[0];
     const unir = {...ventas, ...links};
    // const b= Object.assign(ventas,links);
    // ventas[1][1] =links[0];
   
      console.log(unir);
    res.render('ventas/ListVentas', {links, ventas});
});

// // router.get('/allLinks', isLoggedIn, async(req, res)=>{
// //     const links = await pool.query('SELECT * FROM links');
// //     console.log(links);
// //     res.render('links/list', {links});
// // });

// // router.get('/delete/:id', isLoggedIn, async(req, res) =>{
// //     const {id} = req.params;
// //  await pool.query('DELETE FROM links WHERE ID = ?', [id]);
// //  req.flash('success', 'Se ha eliminado correctamente');
// // res.redirect('/links');

// });
// var prueba = '';
// router.get('/edit/:id', isLoggedIn, async (req, res) =>{
//     const {id} = req.params;
//     const links = await pool.query('SELECT * FROM links WHERE id = ?', [id]);
//    console.log(links[0]);
//    prueba = links[0].title;
//    res.render('links/edit', {link: links[0]});                                                
// });

module.exports = router;
