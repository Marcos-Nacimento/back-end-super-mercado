const mongoose = require('mongoose');
const pagination = require('mongoose-aggregate-paginate-v2');

const ProductModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 50
    },
    image: {
        type: String,
        required: true,
    },
    beforePrice: {
        type: String,
    },
    price: {
        type: String,
        required: true,
    },
    categorie: {
        type: String,
        required: true,
    }
}, {timestamps: true});

ProductModel.plugin(pagination);

module.exports = mongoose.model('product', ProductModel);