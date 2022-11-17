const mysql = require('mysql2');
const express = require("express");
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");
const cors = require('cors');
const path = require('path');


const server = new JSONRPCServer();

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database:'cliente'
});

function obtenerLista() {
  return connection.promise().query("select * from clientes")
  .then((data)=>{
    console.log(data);
    return data[0];
  })
}

function agregarCliente(nombre, direccion, telefono, correo, foto){
  console.log("Se agrego un nuevo cliente...")
  console.log(nombre, direccion, telefono, correo, foto);
  connection.query(
    'INSERT INTO clientes(Nombre,Direccion,Telefono,Email,Foto) VALUES ("'+nombre+'","'+direccion+'","'+telefono+'","'+correo+'","'+foto+'")',
    function(err, results, fields) {
    }
  );
}

function actualizarCliente(nombre, direccion, telefono, correo, foto, id)
{
  console.log("Se actualizo una persona..")
  console.log(nombre, direccion, telefono, correo, foto, id)
  connection.query(
    'UPDATE clientes SET Nombre="'+nombre+'", Direccion="'+direccion+'", Telefono="'+telefono+'", Email="'+correo+'", Foto="'+foto+'" where ClienteID='+id,
    function(err, results, fields) {
  //  obtenerLista();
    }
  );
}


function eliminarCliente({id})
{
  console.log(id)
  connection.query(
    'DELETE FROM clientes WHERE ClienteID='+id,
    function(err, results, fields) {
//    obtenerLista();
    }
  );
}


server.addMethod("obtenerLista",async () => {
  const result = await obtenerLista();
  return result;
})

server.addMethod("agregarCliente",({nombre,direccion, telefono, correo, foto})=>{
  agregarCliente(nombre,direccion,telefono, correo, foto);
  return {status:'ok'}
})

server.addMethod("actualizarCliente",({nombre, direccion, telefono, correo, foto, id}) => {
  actualizarCliente(nombre, direccion, telefono, correo, foto, id);
  return {status:'ok'}
})

server.addMethod("eliminarCliente", id => {
    eliminarCliente(id);
    return {status:'ok'}
})

server.addMethod("echo", ({ text }) => text);
server.addMethod("sumar", ({ valor1,valor2 }) => valor1+valor2);
server.addMethod("log", ({ message }) => console.log(message));

const app = express();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/cliente.html'));
  });

app.use(cors({
  origin: '*'
}));

app.use(bodyParser.json());

app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  // It can also receive an array of requests, in which case it may return an array of responses.
  // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});
console.log('Servidor JSON-RPC corriendo en el puerto 8080..');
app.listen(8080);
