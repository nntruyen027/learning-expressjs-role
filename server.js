const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const accountModel = require('./models/account');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser())

app.use(express.static('./public'));

let checkLogin = (req, res, next) => {
    try {
        var idUser = jwt.verify(req.cookies.token, 'shhh');

        accountModel.findOne({
            _id: idUser.id
        })
            .then((data) => {
                if (data) {
                    req.data = data
                    next()
                }
                else
                    res.redirect('/login');

            })
            .catch((err) => {
                res.json(err);
            })
    }
    catch (err) {
        return res.redirect('/login');
    }
}

let checkRole = (req, res, next, role) => {
    if (req.data.role == role) {
        console.log(req.data.role)
        next();
    }

    else
        res.json('Quyền không hợp lệ! Vui lòng đăng nhập bằng tài khoản khác')
}

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, './views/login.html'))
})

app.get('/student',
    (req, res, next) => {
        checkLogin(req, res, next);
    },
    (req, res, next) => {
        checkRole(req, res, next, 1);
    },
    (req, res, next) => {
        res.sendFile(path.join(__dirname, './views/student.html'))
    }
)

app.get('/teacher',
    (req, res, next) => {
        checkLogin(req, res, next);
    },
    (req, res, next) => {
        checkRole(req, res, next, 2)
    },
    (req, res, next) => {
        res.sendFile(path.join(__dirname, './views/teacher.html'))
    }
)

app.post('/login', (req, res, next) => {
    accountModel.findOne(
        {
            username: req.body.username,
            password: req.body.password
        }
    )
        .then(data => {
            if (data) {
                var idAcc = data._id.toString()
                var token = jwt.sign({
                    id: idAcc
                }, 'shhh', {
                    expiresIn: '1h'
                })

                res.json({
                    message: 'Đăng nhập thành công',
                    token: token
                })
            }
            else
                return res.json('Đăng nhập thất bại')
        })
})

app.listen(3000);