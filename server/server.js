const http=require('http');
const db=require('./db.json');

const host='localhost';
const port=5000;

const requestListener=function(req,res){
    res.setHeader("Content-Type","application/json");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify(db));
}

const server=http.createServer(requestListener);
server.listen(port,host,()=>console.log(`server - http://${host}:${port}`));
