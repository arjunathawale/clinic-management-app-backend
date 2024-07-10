const mysql = require('mysql');

var config = {
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: 'IST',
    multipleStatements: true,
    charset: 'utf8mb4_general_ci'
}

exports.runQuery = (query, callback) => {
    var connection = mysql.createConnection(config);
    try {
        connection.connect();
        console.log(query);
        connection.query(query, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
    } finally {
        connection.end();
    }
}

exports.runQueryData = (query, data, callback) => {
    var connection = mysql.createConnection(config);
    try {
        connection.connect();
        console.log(query, data);
        connection.query(query, data, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
    } finally {
        connection.end();
    }
}

exports.runDML = (query, data, connection, callback) => {
    try {
        console.log(query, data);
        connection.query(query, data, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        callback(error);
    } finally {
        // dbConfig.end();
    }
}

exports.getSystemDate = function () {
    let date_ob = new Date();

    // current date 
    // adjust 0 before single digit date
    let day = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);

    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);

    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    date_cur = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return date_cur;
}

exports.rollbackConnection = (connection) => {
    try {
        connection.rollback(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.commitConnection = (connection) => {
    try {
        connection.commit(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.openConnection = () => {
    try {
        const con = mysql.createConnection(config);
        con.connect();
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
        });
        return con;
    }
    catch (error) {
        console.error(error);
    }
}
