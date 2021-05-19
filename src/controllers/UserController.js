const UserModel = require('../models/UserModel');
const BlackListTokenModel = require("../models/BlackListTokenModel");
const CodeSecurityModel = require('../models/CodeSecurityModel');

const validator = require('email-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer')

const authConfig = require('../config/auth.json');

class UserController {
    async register(req, res) {
        try {
            let { name, email, password, cpf, phone, lastName } = req.body;
            
            if(!name || !email || !password || !cpf || !phone || !lastName) {
                return res.status(400).send('Oops, estamos com problemas!');
            };

            if(!validator.validate(email)) {
                return res.status(400).send('email inválido!');
            };

            if(await UserModel.findOne({email: email})) {
                return res.status(400).send('Este email já está em uso!');
            };

            if(await UserModel.findOne({cpf: cpf})) {
                return res.status(400).send('Este CPF já está cadastrado!');
            };

            const user = await UserModel.create({
                name: name,
                email: email,
                password: password,
                cpf: cpf,
                phone: phone,
                lastName: lastName,
            });
            
            const token =  jwt.sign({id: user._id}, authConfig.secret, {
                expiresIn: '60d',
            });

            user.password = undefined;

            res.json({user, token: token, auth: true});

        }catch(error) {
            res.status(400).send(error);
        }
    };
    async authentication(req, res) {
        const { email, password } = req.body;

        try {
            const user = await UserModel.findOne({email: email});
            
            if(!user) {
                return res.status(400).send('email incorreto ou aconta não existe!');
            };

            if(!await bcrypt.compare(password, user.password)) {
                return res.status(400).send('senha incorreta!');
            };

            const token =  jwt.sign({id: user._id}, authConfig.secret, {
                expiresIn: '60d',
            });

            user.password = undefined;

            res.json({user, token: token, auth: true})

        }catch(error) {
            res.status(400).send({ msg: error });
        }
    };
    async update(req, res) {
        let { id, ...data} = req.body;

        try {
            let user = await UserModel.findByIdAndUpdate(id, data, {
                new: true,
            });

            user.password = undefined;

            res.json(user);
        }catch(error) {
            return res.status(400).send(error);
        }

    };
    async forgot(req, res) {
        let { email } = req.body;
        
        try {
            if(!email) {
                return res.status(400).end();
            };
    
            let user = await UserModel.findOne({ email: email });
      
            if(!user) {
                return res.status(200).end();
            };
            
            let code = `${Math.floor(Math.random() * 99999)}`.padStart(6, '0');
    
            let findCodeDeleteId = await CodeSecurityModel.findOne({
                userId: user._id,
            });

            // se o code anterior existe delete
            if(findCodeDeleteId) {
                await CodeSecurityModel.findByIdAndDelete(findCodeDeleteId._id);
            }

            // salve o novo code
            await CodeSecurityModel.create({
                userId: user._id,
                code: code,
            });
            
            let mailOptions = {
                from: "hello main",
                to: user.email,
                subject: 'redefinição de senha',
                text: `	Olá ${user.name}, seu code de é: ${code}`
            };
    
            let transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'marcosftp1@gmail.com',
                    pass: 'Void#123'
                }
            });

            await transport.sendMail(mailOptions);
    
            res.status(200).end();
        }catch(error) {
            res.json(error);
        };

    };
    async codeSecurity(req, res) {
        let { code } = req.body;

        if(!code) {
            return res.status(400).send('estamos com problemas');
        };

        try {
            let findCode = await CodeSecurity.findOne({
                code: code,
            });

            if(!findCode) {
                return res.status(400).send('codigo invalido!');
            };

            const token =  jwt.sign({id: findCode.userId}, authConfig.secretRestPassword, {
                expiresIn: 300000, // 5 minutos.
            });

            res.json({token: token, findCode});
        }catch(error) {
            res.json(error);
        };
    };
    async reset(req, res) {
        let { userId, password, sourceToken } = req.body;

        if(!userId || !password || !sourceToken) {
            return res.status(400).end();
        };

        jwt.verify(sourceToken, authConfig.secretRestPassword, (err, success) => {
            if(err) {
                return res.status(401).end();
            };
        });

        let hash = await bcrypt.hash(password, 10);

        const token =  jwt.sign({id: userId}, authConfig.secret, {
            expiresIn: '60d',
        });

        try {
            let user = await UserModel.findByIdAndUpdate(userId, {
                password: hash,
            });

            user.password = undefined;
            res.json({auth: true, user, token: token});
        }catch(error) {
            res.json(error);
        };
    }
    async logout(req, res) {
        let token = req.headers['x-access-token'];

        try {
            let success = await BlackListTokenModel.create({
                token: token,
            });

            if(!success) {
                return res.status(400).send({ msg: "Oops, estamos com problemas!" });
            };

            res.status(200).send({ msg: "bye bye, good bye!" });

        }catch(error) {
            res.status(400).send({ msg: error });
        }
    };
    async verifyJWT(req, res, next) {
        const token = req.headers['x-access-token'];
        // verifica se o token nao esta na lista negra.
        if(await BlackListTokenModel.findOne({ token: token })) {
            return res.sendStatus(401).end();
        };

        jwt.verify(token, authConfig.secret, (erro, decoded) => {
            if(erro) {
                return res.sendStatus(401).end();
            }

            next()
        })
    };
};

module.exports = new UserController;