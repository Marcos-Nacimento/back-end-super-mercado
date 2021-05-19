const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

mongoose.connect('mongodb+srv://dell:void1234567@cluster0.wpict.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

// routes
const routes = require('../routes');

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(process.env.PORT || 3001, () => {
    console.log('runing app!');
});