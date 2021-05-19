const ProductModel = require('../models/ProductModel');

class ProductController {
    async index(req, res) {
        let { categorie, numberPage } = req.params;

        let query = ProductModel.aggregate([
            {$match: {categorie: categorie}}
        ]);

        let option = { page: numberPage, limit: 10 };

        try {
            let products = await ProductModel.aggregatePaginate(query, option);
            res.json(products);
        }catch(error) {
            return res.status(400).send(error);
        }
    };
    async create(req, res) {
        let { name, image, beforePrice, price, categorie } = req.body;

        if(!name || !image || !price || !categorie ) {
            return res.status(400).send('estamos com problemas!');
        };

        try {
            let createdProduct = await ProductModel.create({
                name: name,
                image: image,
                beforePrice: beforePrice,
                price: price,
                categorie: categorie,
            });

            res.json(createdProduct);
        }catch(error) {
            return res.status(400).send(error);
        };
    };
    async search(req, res) {
        let { query } = req.params;

        try {
            let results = await ProductModel.collection.aggregate([{
                "$search": {
                    "autocomplete": {
                        "query": `${query}`,
                        "path": "name",
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3,
                        }
                    }
                }
            }]).toArray();

            res.send(results);
        }catch(error) {
            res.status(400).send(error);
        };
    };
    async update(req, res) {
        let { id, ...data } = req.body;

        if(!id) {
            return res.status(400).send('estamos com problemas!');
        };

        try {
            let result = await ProductModel.findByIdAndUpdate(id, data, { new: true });
            res.json(result);
        }catch(error) {
            res.status(400).send(error);
        };
    };
    async delete(req, res) {
        let { id } = req.params;

        if(!id) {
            return res.status(400).send('estamos com problemas');
        };

        try {
            await ProductModel.findByIdAndDelete(id, (error, success) => {
                if(error) {
                    return res.status(400).send('não é possivel deletar o produto');
                };

                res.status(200).send('produto deletado com sucesso');
            });
        }catch(error) {
            res.status(400).send(error);
        };
    };
};

module.exports = new ProductController;