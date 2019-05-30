var crypto = require('crypto');
var express = require('express');
var jwt = require('jsonwebtoken');
var fs = require('fs');

var router = express.Router();

// Secret JWT
const SECRET = "Israel is real?";
// Path file
const filePath = './dataBase/users.txt';

// POST
router.post('/', (req, res) => {
  // Init a Date
  var date = new Date();
  var body = req.body;

  // Validate JSON
  if (!validatorCadastro(body)) {
    res.status(422).json({ mensagem: 'Dados Invalidos' }).end();
  } else {
    // Crypto password
    var passwd = crypto.createHash('md5').update(body.senha).digest('hex');
    // Create a JWT
    var token = jwt.sign({ email: body.email }, SECRET);
    
    var user = {
      nome: body.name,
      email: body.email,
      senha: passwd,
      telefone: body.telefone,
      data_criacao: date.toLocaleString(),
      data_atualizacao: '',
      token: token,
    };
    
    // Save file at txt
    saveFile(user, (err, result) => {
      if (err || !result) {
        res.status(422).json(err).end();
      } else {
        res.status(200).json(user).end();
      }
    })
  }
});

// GET
router.get('/', (req, res) => {
  var body = req.body
  
  // Validate the JSON
  if (!validatorLogin(body)) {
    res.status(422).json({ mensagem: 'Dados Invalidos' }).end();
  } else {
    // Crypto the password
    var passwd = crypto.createHash('md5').update(body.senha).digest('hex');
    var user = {
      email: body.email,
      senha: passwd
    };
    // Search user by email
    searchUser(user.email, (err, result) => {
      // check is error at search
      if (err || !result) {
        res.status(422).json({ mensagem: 'E-mail Invalido!' }).end();
      } else {
        // Check if the passwd is equal that file
        if (result.senha == user.senha){
          res.status(200).json(result).end();
        } else {
          res.status(401).json({ mensagem: 'Senha Invalida!' }).end();
        }
      }
    });
  }
})

// Validade JSON POST
function validatorCadastro(body) {
  if (body.name === null || body.name === '') {
    return false;
  } else if (body.email === null || body.email === '') {
    return false;
  } else if (body.senha === null || body.senha === '') {
    return false;
  } else if (body.telefone.numero === null || body.telefone.numero === '') {
    return false;
  } else if (body.telefone.ddd === null || body.telefone.ddd === '') {
    return false;
  } else {
    return true;
  }
}

// Validat JSON GET
function validatorLogin(body) {
  if (body.email === null || body.email === '') {
    return false;
  } else if (body.senha === null || body.senha === '') {
    return false;
  } else {
    return true;
  }
}

// Save user file.txt
function saveFile(data, callback) {
  searchUser(data.email, (err, result) => {
    if ((err && !err.status == 'Email não encontrado!') || !result) {
      callback(err, null);
    } else {
      fs.appendFile(filePath, JSON.stringify(data) + ';', (err) => {
        if (err || !result) {
          callback({
            mensagem: 'Erro ao adicionar usuario!'
          }, null);
        } else {
          callback(null, {
            status: 'OK'
          });
        }
      });
    }
  });
};

// Search um at file.txt
function searchUser(data, callback) {
  fs.readFile(filePath, 'utf8', (err, result) => {
    if (err || !result) {
      if (err.code === 'ENOENT') {
        callback(null, { status: 'OK' });
      } else {
        callback({
          mensagem: 'Erro ao ler arquivo!'
        }, null);
      }
    } else {
      var userList = result.toString().split(';');
      var user = undefined;
      // Search if exist the user at the file
      for (const i in userList) {
        userList[i] = JSON.parse(userList[i]);
        if (userList[i].email === data) {
          user = userList[i];
          break;
        }
      }
      if (user) {
        callback(null, user);
      } else {
        callback({ ststus: 'Email não encontrado!'}, null);
      }
    }
  });
};

module.exports = router;