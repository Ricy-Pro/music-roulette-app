
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
router.post('/signup', (req, res) => {
    let {name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();

    if (name == '' || email == '' || password == '' || dateOfBirth == '') {
        res.json({status: 'FAILED', 
        message: 'Please enter all fields'});
        return;
    }
    else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({status: 'FAILED', 
        message: 'Invalid name. Only letters are allowed'});
        return;
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({status: 'FAILED', 
        message: 'Invalid email. Please enter a valid email address'});
        return;
    }
    else if (!new Date(dateOfBirth).getTime()){
        res.json({status: 'FAILED', 
        message: 'Invalid date of birth. Please enter a valid date of birth'});
        return;
    
    }
    else if (password.length < 8) {
        res.json({status: 'FAILED', 
        message: 'Password must be at least 8 characters'});
        return;
    }
    else {
        User.find({email}).then(result => {
            if (result.length) {
                res.json({status: 'FAILED', message: 'Email already exists'});
                return;}
            else {
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,
                    });
                    newUser.save().then(result=> {
                        res.json({status: 'SUCCESS', message: 'User registered successfully',
                            data: result});
                        }).catch (err => {
                            console.log(err);
                            res.json({status: 'FAILED', message: 'An error occurred while saving user.'});
                        });
                }).catch(err => {
                    console.log(err);
                    res.json({status: 'FAILED', message: 'An error occurred while hashing password.'});
                });

            }
        }).catch(err => {
        console.log(err);
        res.json({status: 'FAILED', message: 'An error occurred while checking for existing user.'});

                        });
        };
});

router.post('/login', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();
    if (email == '' || password == '') {
        res.json({status: 'FAILED', message: 'Empty credentials supplied'});
    }
    else {
        User.find({email}).then(data => {
            if (data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        const user = {
                            name: data[0].name,
                            email: data[0].email,
                            dateOfBirth: data[0].dateOfBirth
                            
                        };
                        res.json({status: 'SUCCESS', message: 'Login successful', data: user});
                    }
                    else {
                        res.json({status: 'FAILED', message: 'Invalid password'});
                    }
                }).catch(err => {
                    console.log(err);
                    res.json({status: 'FAILED', message: 'An error occurred while comparing passwords'});
                });
            }
            else {
                res.json({status: 'FAILED', message: 'Invalid credentials entered!'});
            }
        }).catch(err => {
            console.log(err);
            res.json({status: 'FAILED', message: 'An error occurred while checking for existing user'});
        });
    }
});
module.exports = router;
