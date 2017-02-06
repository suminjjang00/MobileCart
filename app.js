const express = require('express');
const http = require('http');
const ejs = require('ejs');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();

const server = http.createServer(app);

app.use(express.static(__dirname+'/public'));

app.get('/',(request,response)=>{
  console.log('app.get request,response..');
  var htmlPage = fs.readFileSync('HTML_Page.html','utf8');
  response.send(ejs.render(htmlPage,{
    products: products
  }));
});
server.listen(10115,()=>{
  console.log('this is test server...');
});
var counter = 0;
function product(name,image,price,count){
  this.index=counter++;
  this.name=name;
  this.image=image;
  this.price=price;
  this.count=count;
};
let products = [
  new product('chrome','chrome.png','300',30),
  new product('sumin','chrome.png','1000',30),
  new product('who','chrome.png','500',30),
  new product('coffee','chrome.png','5',30),
  new product('book','chrome.png','300000',30),
  new product('pencil','chrome.png','1200',30),
];

const io = socketio.listen(server);

io.sockets.on('connection',(socket)=>{
  var cart={};
  socket.on('cart',(index)=>{
    console.log(index+'index number..');
    products[index].count--;
    // push in cart
    cart[index]={};
    cart[index].index=index;
    cart[index].timerID = setTimeout(()=>{
      onReturn(index);
    },10*60*1000);
    io.sockets.emit('count',{
      index:index,
      count:products[index].count
    });
  });
  function onReturn(index){
    products[index].count++;

    clearTimeout(cart[index].timerId);

    delete cart[index]

    io.sockets.emit('count',{
      index:index,
      count:products[index].count
    });
  };
  socket.on('buy',(index)=>{
    clearTimeout(cart[index].timerID);
    delete cart[index];

    io.sockets.emit('count',{
      index:index,
      count:products[index].count
    });
  });
  socket.on('return',(index)=>{
    onReturn(index);
  });

  console.log('socket io connection');
});
