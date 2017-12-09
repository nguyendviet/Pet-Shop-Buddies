module.exports = (app)=>{
    app.get('/', (req, res)=>{
        res.render('index');
    });

    app.get('/error', (req, res)=>{
        res.render('error');
    });

    app.get('/deleted', (req, res)=>{
        res.render('deleted');
    });
};