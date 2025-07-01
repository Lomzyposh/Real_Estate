require('dotenv').config();

const sql = require('mssql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true
  }
};

const poolPromise = sql.connect(config);


async function addUserToDB(email, plainPassword) {
  console.log('Adding user to DB:', email);
  const pool = await poolPromise;

  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  const queryString = `
    INSERT INTO Users (email, password)
    VALUES (@email, @password)`;

  try {
    const checkQuery = `
      SELECT COUNT(*) AS count FROM Users WHERE email = @email
    `;

    const checkResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      return { success: false, message: 'Email already exists' };
    }

    await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query(queryString);

    return { success: true, message: 'User added successfully' };
  } catch (err) {
    console.error('Error adding user:', err);
    return { success: false, message: 'Failed to add user' };
  }
}

async function findUserId(sessionId) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('sessionId', sql.VarChar, sessionId)
      .query('SELECT u.userId, u.email, u.role, l.name FROM Users u LEFT JOIN lenders l ON u.userId = l.userId WHERE u.userId = @sessionId');
    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (err) {
    console.error('Error finding userId:', err);
    throw err;
  }
}

async function getUserByEmail(email, password) {
  const pool = await poolPromise;

  try {
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT userId, email, password, role FROM Users WHERE email = @email;');


    if (result.recordset.length === 0) {
      console.log('No user found with that email.');
      return null;
    }
    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      console.log('User authenticated:', user.email);
      return {
        success: true,
        message: {
          id: user.userId,
          role: user.role,
        }
      };
    } else {
      console.log('Password is incorrect.');

      return { success: false, message: 'Incorrect Credentials' }
    }
  } catch (err) {
    console.error('Error fetching user by email:', err);
    throw err;
  }
}

async function addProperty(data) {
  const { title, type, price, propCity } = data;


  const pool = await poolPromise;
  const sqlQuery = `
      INSERT INTO Properties
      (title, type, price)
      VALUES (@title, @type, @price)

      SELECT propertyId FROM Properties WHERE propIdentity = SCOPE_IDENTITY();
    `;

  const propertyResult = await pool.request()
    .input('title', sql.VarChar, title)
    .input('type', sql.VarChar, type)
    .input('price', sql.Decimal, price)
    .query(sqlQuery);

  console.log("Added first Part.")

  const propertyId = propertyResult.recordset[0].propertyId;

  const insertLocationQuery = `
    INSERT INTO propLocation (propertyId,city)
    VALUES (@propertyId, @city)
  `;

  await pool.request()
    .input('propertyId', sql.VarChar, propertyId)
    .input('city', sql.VarChar, propCity)
    .query(insertLocationQuery);

  console.log("Added the location also...😁")
}

async function insertProperty(data) {
  // const pool = await poolPromise;

  // await pool.request()
  //     .input('propertyId', sql.VarChar, data.basic.id)
  //     .input('title', sql.VarChar, data.basic.title)
  //     .input('type', sql.VarChar, data.basic.type)
  //     .input('status', sql.VarChar, data.basic.status)
  //     .input('price', sql.Int, data.basic.price)
  //     .input('bedrooms', sql.Int, data.basic.bedrooms)
  //     .input('bathrooms', sql.Int, data.basic.bathrooms)
  //     .input('areaSqFt', sql.Int, data.basic.areaSqFt)
  //     .input('yearBuilt', sql.Int, data.basic.yearBuilt)
  //     .input('floorCount', sql.Int, data.basic.floorCount)
  //     .input('floorLevel', sql.Int, data.basic.floorLevel)
  //     .query(`
  //   INSERT INTO Properties 
  //   (propertyId, title, type, status, price, bedrooms, bathrooms, areaSqFt, yearBuilt, floorCount, floorLevel) 
  //   VALUES (@propertyId, @title, @type, @status, @price, @bedrooms, @bathrooms, @areaSqFt, @yearBuilt, @floorCount, @floorLevel)
  // `);
  for (const history of data.priceHistory) {
    await pool.request()
      .input('propertyId', sql.VarChar, data.basic.id)
      .input('price', sql.Decimal, history.price)
      .input('date', sql.Date, history.date)
      .input('status', sql.VarChar, history.status)
      .query(`
      INSERT INTO PriceHistory 
      (propertyId, price, date, status)
      VALUES (@propertyId, @price, @date, @status)
    `);
  }
}

async function showAgents() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
      a.[agentId],
      a.[name],
      a.[rating],
      lang.languages,
      a.[priceMin],
      a.[priceMax],
      hours.availableHours,
      days.availableDays
      FROM Agents a
      LEFT JOIN (
        SELECT agentId, STRING_AGG([language], ', ') AS languages
        FROM AgentLanguages
        GROUP BY agentId
      ) lang ON a.agentId = lang.agentId
      LEFT JOIN (
        SELECT agentId, STRING_AGG([hours], ', ') AS availableHours
        FROM AgentAvailabilityHours
        GROUP BY agentId
      ) hours ON a.agentId = hours.agentId
      LEFT JOIN (
        SELECT agentId, STRING_AGG([dayOfWeek], ', ') AS availableDays
        FROM AgentAvailabilityDays
        GROUP BY agentId
      ) days ON a.agentId = days.agentId;
    `);
    return result.recordset;
  } catch (err) {
    console.error('Error fetching agents:', err);
    throw err;
  }
}

async function forgotPassword(email, code) {

  const sqlQuery = `UPDATE Users SET resetCode = @resetCode, resetExpires = DATEADD(MINUTE, 15, GETDATE()) WHERE email = @email`;
  try {
    const pool = await poolPromise;

    const hashedCode = await bcrypt.hash(code, saltRounds);

    await pool.request()
      .input('email', sql.VarChar, email)
      .input('resetCode', sql.VarChar, hashedCode)
      .query(sqlQuery);

    return { success: true, message: 'Reset code set successfully.' };
  } catch (err) {
    console.error('Reset error:', err);
  }

}

module.exports = {
  sql,
  poolPromise,
  addUserToDB,
  insertProperty,
  getUserByEmail,
  showAgents,
  addProperty,
  forgotPassword,
  findUserId
};

