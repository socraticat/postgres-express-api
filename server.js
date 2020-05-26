import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import env from './env';
import usersRt from './app/routes/usersRt';

const app = express();

// Add middleware for parsing URL encoded bodies (which are usually sent by browser)
app.use(cors());
// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Register v1 routes
app.use('/api/v1', usersRt);

app.listen(env.port).on('listening', () => {
    console.log(`Postgres Server live on :${env.port}`);
});


export default app;