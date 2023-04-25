const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Taka%0402',
  database: 'list_app'
});


app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/index', (req, res) => {
  connection.query(
    'SELECT * FROM items',
    (error, results) => {
      res.render('index.ejs', {items: results});
    }
  );
});

app.get('/new', (req, res) => {
  res.render('new.ejs');
});

app.post('/create', (req, res) => {
  connection.query(
    'INSERT INTO items (name) VALUES (?)',
    [req.body.itemName],
    (error, results) => {
      res.redirect('/index');
    }
  );
});

app.post('/delete/:id', (req, res) => {
  connection.query(
    'DELETE FROM items WHERE id = ?',
    [req.params.id],
    (error, results) => {
      res.redirect('/index');
    }
  );
});

app.get('/edit/:id', (req, res) => {
  connection.query(
    'SELECT * FROM items WHERE id = ?',
    [req.params.id],
    (error, results) => {
      res.render('edit.ejs', {item: results[0]});
    }
  );
});

app.post('/update/:id', (req, res) => {
  // 選択されたメモを更新する処理を書いてください
  connection.query(
    'UPDATE items SET money=? WHERE id=?',
    [req.body.itemMoney, req.params.id],
    (error,results) => {
      res.redirect('/index');
    }
    );
  // 以下の一覧画面へリダイレクトする処理を削除してください
});

app.get('/total', (req, res) => {
  connection.query(
    'SELECT * FROM items',
    (error, results) => {
      let total = 0;
      for (let i = 0; i < results.length; i++) {
        total += results[i].money;
      }
      
      const average = total / results.length;
      let gap = [];
      for (let i = 0; i < results.length; i++) {
        gap.push(results[i]);
        gap[i].money -= average;
      }
      gap.sort(function(a, b) {
        return a.money - b.money;
      });
      let plusindex = 0;
      for (let i = 0; i < gap.length; i++) {
          if (gap[i].money > 0){
            plusindex = i;
            break;
          }
      }
      console.log(gap);
      console.log(plusindex);
      let seisan = new Array(gap.length).fill(null).map(() => []);
      let c = 0;
      for (let i = 0; i< gap.length; i++) {
        let b = 0;
        if (i < plusindex -1){
          b = c + Math.abs(gap[i].money);
          seisan[i].push({'s': gap[i].name, 'd': gap[i+1].name, 'm': b});
          c = b;
        }else if(i > plusindex -1){
          seisan[i].push({'s': gap[i].name, 'd': gap[plusindex-1].name, 'm': gap[i].money});
        }
      }
      
      console.log(seisan);
      let seisan2 = seisan.flatMap(innerArray => innerArray);
      console.log(seisan2);
      res.render('total.ejs', {total: total, average: average, gaps:gap, seisans:seisan2});
    }
  );

});

connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});


app.listen(3000);
