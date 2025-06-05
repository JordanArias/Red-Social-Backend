'use strict';

var path = require('path');
var fs = require('fs');
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

async function savePublication(req, res){
    var params = req.body;
    var user_id = req.user.id;
    var validation = new Publication();
    
    if(!params.text && !req.file){
        return res.status(400).send({
            status: 'error',
            message: 'No se ha subido ninguna imagen'
        });
    }
    
}

module.exports = {
    savePublication
}




