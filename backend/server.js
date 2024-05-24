require('dotenv').config();
require('./config/db.js');  

const app = require('express')();
const port = process.env.PORT || 3000;
const UserRouter = require('./api/User.js');
const bodyParser = require('express').json();

app.use(bodyParser);
app.use('/user', UserRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
