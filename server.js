const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(require('./routes/api.js'));
console.log("hello")
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/budget-tracker', {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//use this to log mongo queries
mongoose.set('debug',true);

app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));
