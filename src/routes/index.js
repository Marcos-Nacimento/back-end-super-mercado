const { Router } = require('express');

const router = Router();

// controllers
const UserController = require('../controllers/UserController');
const ProductController = require('../controllers/ProductController');

// routers user
router.post('/account/register', UserController.register);
router.post('/account/authentication', UserController.authentication);
router.put('/account/update', UserController.verifyJWT, UserController.update);
router.post('/account/forgot', UserController.forgot);
router.post('/account/reset', UserController.reset);
router.post('/account/code', UserController.codeSecurity);
router.post('/account/logout', UserController.verifyJWT, UserController.logout);

// products
router.get('/product/list/:numberPage/:categorie', ProductController.index);
router.post('/product/create', ProductController.create);
router.get('/product/:query', ProductController.search);
router.put('/product/update', ProductController.update);
router.delete('/product/delete/:id', ProductController.delete);

module.exports = router;