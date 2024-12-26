const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.SERVER_PORT || 3000;

const UserRoute = require('./routes/UserRoute');
const QuestionnaireRoute = require('./routes/QuestionnaireRoute');


const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
const UserController = require('./controllers/UserController');

app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
});

mongoose.connect('mongodb://127.0.0.1:27017/randd_db').then(async () => {
    try {
        await UserController.initializeAdmin();
    } catch (error) {
        console.error("Failed to initialize admin, but continuing startup:", error);
    }
    app.listen(PORT, () => {
        console.log(`API started and running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Failed to connect to MongoDB:", error);
});



app.use('/api/v1/users', UserRoute);
app.use('/api/v1/questionnaire', QuestionnaireRoute);


module.exports = app;