'use strict'
var User = require('../models/user');

//rutas
function home(req, res) {
    res.status(200).send({
        message: "HOME Bienvenido al API REST de la Red Social"
    });
}
function test(req, res) {
    res.status(200).send({
        message: "TEST Bienvenido al API REST de la Red Social"
    });
}

module.exports = {
    home,
    test
};