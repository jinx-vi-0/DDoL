import http from 'http';

export default function keepAlive() {
    http.createServer((req, res) => {
        res.write("I'm alive");
        res.end();
    }).listen(8080);

    console.log("Server is running on port 8080");
}
