const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./portfolio.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the portfolio SQLite database.');
});

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const convertDate = (dateStr) => {
  if (!dateStr || dateStr.toLowerCase() === 'present') return '9999-99-99'; // Assign a high value for sorting
  const [year, month, day] = dateStr.split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // returns date in 'YYYY-MM-DD' format
};

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/api/data', (req, res) => {
  db.serialize(() => {
    const responseData = {
      cv: {
        workExperience: [],
        education: [],
      },
      projects: [],
    };

    db.all(
      `SELECT * FROM work_experience ORDER BY 
      CASE 
        WHEN end_date = '' THEN 0
        WHEN end_date = 'present' THEN 1
        ELSE 2
      END,
      CASE 
        WHEN end_date = '' THEN '9999-99-99'
        ELSE end_date
      END DESC`,
      (err, workExperienceRows) => {
        if (err) {
          res.status(500).send('Error loading work experience from SQLite');
          return;
        }

        workExperienceRows.forEach((row) => {
          responseData.cv.workExperience.push({
            ...row,
            responsibilities: JSON.parse(row.responsibilities),
          });
        });

        db.all(
          `SELECT * FROM education ORDER BY 
          CASE 
            WHEN end_date = '' THEN 0
            WHEN end_date = 'present' THEN 1
            ELSE 2
          END,
          CASE 
            WHEN end_date = '' THEN '9999-99-99'
            ELSE end_date
          END DESC`,
          (err, educationRows) => {
            if (err) {
              res.status(500).send('Error loading education from SQLite');
              return;
            }

            educationRows.forEach((row) => {
              responseData.cv.education.push({
                ...row,
                thesisSupervisors: JSON.parse(row.thesis_supervisors),
              });
            });

            db.all('SELECT * FROM projects', (err, projectRows) => {
              if (err) {
                res.status(500).send('Error loading projects from SQLite');
                return;
              }

              responseData.projects = projectRows;

              res.status(200).json(responseData);
            });
          }
        );
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', username, (err, row) => {
    if (err) {
      res.status(500).send('Error querying the database');
      return;
    }

    if (!row) {
      res.status(401).json({ message: 'Invalid username or password' }); // Send JSON response
      return;
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (err) {
        res.status(500).send('Error comparing passwords');
        return;
      }

      if (!result) {
        res.status(401).json({ message: 'Invalid username or password' }); // Send JSON response
        return;
      }

      res.status(200).json({
        message: 'Login successful', // Add a message property
        username: row.username,
        role: row.role,
      });
    });
  });
});

app.put('/api/work_experience/:id', (req, res) => {
  const { id } = req.params;
  const { company, position, start_date, end_date } = req.body;

  const sql = 'UPDATE work_experience SET company = ?, position = ?, start_date = ?, end_date = ? WHERE id = ?';
  const params = [company, position, start_date, convertDate(end_date), id];

  db.run(sql, params, (err) => {
    if (err) {
      res.status(500).send('Error updating work experience in SQLite');
      return;
    }
    res.status(200).send('Work experience updated successfully');
  });
});

app.put('/api/education/:id', (req, res) => {
  const { id } = req.params;
  const { institution, degree, start_date, end_date } = req.body;

  const sql = 'UPDATE education SET institution = ?, degree = ?, start_date = ?, end_date = ? WHERE id = ?';
  const params = [institution, degree, start_date, convertDate(end_date), id];

  db.run(sql, params, (err) => {
    if (err) {
      res.status(500).send('Error updating education in SQLite');
      return;
    }
    res.status(200).send('Education updated successfully');
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});