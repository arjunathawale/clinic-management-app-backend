const mm = require('../utilities/dbConfig');
const jwt = require('jsonwebtoken');
var userMaster = "user_master";
var viewUserMaster = "view_" + userMaster;
const md5 = require("md5")
function reqData(req) {

    var data = {
        NAME: req.body.NAME,
        EMAIL_ID: req.body.EMAIL_ID,
        MOBILE_NO: req.body.MOBILE_NO,
        PASSWORD: req.body.PASSWORD,
        STATUS: req.body.STATUS
    }
    return data;
}

exports.get = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    console.log(pageIndex + " " + pageSize)
    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
        console.log(start + " " + end);
    }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';  

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    try {
        mm.runQuery('select count(*) as cnt from ' + viewUserMaster + ' where 1 ' + countCriteria, (error, results1) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get users count.",
                });
            } else {
                mm.runQuery('select * from ' + viewUserMaster + ' where 1 ' + criteria, (error, results) => {
                    if (error) {
                        console.log(error);
                        res.send({
                            "statusCode": 400,
                            "message": "Failed to get users."
                        });
                    }
                    else {
                        res.send({
                            "statusCode": 200,
                            "message": "success",
                            "count": results1[0].cnt,
                            "data": results
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.create = (req, res) => {

    var data = reqData(req);
    try {
        mm.runQueryData('INSERT INTO ' + userMaster + ' SET ?', data, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save users..."
                });
            }
            else {
                res.send({
                    "statusCode": 200,
                    "message": "User Created...!",
                });
            }
        });
    } catch (error) {
        console.log(error)
    }

}

exports.update = (req, res) => {
    var data = reqData(req);
    var criteria = {
        ID: req.body.ID,
    };
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] != null ? setData += `${key}= ? , ` : true;
        data[key] != null ? recordData.push(data[key]) : true;
    });

    try {
        mm.runQueryData(`UPDATE ` + userMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to update user."
                });
            }
            else {
                console.log(results);
                res.send({
                    "statusCode": 200,
                    "message": "User Updated...",
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function generateToken(userId, res, resultsUser) {

    try {
        var data = {
            "USER_ID": userId,
        }

        jwt.sign({ data }, process.env.SECRET, (error, token) => {
            if (error) {
                console.log("token error", error)
            }else {
                res.send({
                    "statusCode": 200,
                    "message": "Logged in...",
                    "data": [{
                        "token": token,
                        "UserData": resultsUser
                    }]
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.login = (req, res) => {
    try {
        var username = req.body.username;
        var password = req.body.password;

        if ((!username || username == '' || username == undefined) || (!password || password == '' || password == undefined)) {
            res.send({
                "statusCode": 400,
                "message": "username or password parameter missing",
            });
        } else {
            var md5pass = md5(password);
            console.log("md5pass", md5pass);
            mm.runQueryData(`SELECT * FROM user_master WHERE  1 AND (MOBILE_NO =? or EMAIL_ID=?) and STATUS = 1`, [username, username], (error, results1) => {
                if (error) {
                    console.log(error);
                    res.send({
                        "statusCode": 400,
                        "message": "Failed to get record",
                    });
                }
                else {
                    if (results1.length > 0) {
                        if (results1[0].PASSWORD === md5pass) {
                            // mm.runQueryData(`SELECT ROLE_ID, ROLE_NAME FROM view_client_role_mapping where USER_ID = ${results1[0].ID}`, [], (error, resultRole) => {
                            //     if (error) {
                            //         console.log(error);
                            //         res.send({
                            //             "statusCode": 400,
                            //             "message": "Failed to get role records",
                            //         });
                            //     }
                            //     else {
                                    var userDetails = [{
                                        USER_ID: results1[0].ID,
                                        NAME: results1[0].NAME,
                                        EMAIL_ID: results1[0].EMAIL_ID,
                                        MOBILE_NO: results1[0].MOBILE_NO,
                                        IS_ADMIN: results1[0].IS_ADMIN,

                                    }]
                                    generateToken(results1[0].ID, res, userDetails);


                            //     }
                            // });
                        } else {
                            res.send({
                                "statusCode": 400,
                                "message": "You Have Entered a Wrong Password",
                            });
                        }
                    } else {
                        res.send({
                            "statusCode": 400,
                            "message": "User Not Found",
                        });
                    }
                }
            });
        }

    } catch (error) {
        console.log(error);
    }

}

exports.changePassword = (req, res) => {
    try {
        var ID = req.body.WP_CLIENT_ID;
        var OLD_PASSWORD = req.body.OLD_PASSWORD;
        var NEW_PASSWORD = req.body.NEW_PASSWORD;
        var systemDate = mm.getSystemDate();

        if (ID && ID != " " && NEW_PASSWORD && NEW_PASSWORD != " " && OLD_PASSWORD && OLD_PASSWORD != " ") {
            var connection = mm.openConnection();
            mm.runDML(`select PASSWORD, NAME, ID from user_master where ID = ? AND PASSWORD = ? limit 1`, [ID, OLD_PASSWORD],
                connection, (error, results) => {
                    if (error) {
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            statusCode: 400,
                            message: "Failed to get PASSWORD details ",
                        });
                    } else {
                        let PASSWORD = md5(NEW_PASSWORD);
                        if (results.length > 0) {
                            mm.runDML(`update user_master SET PASSWORD = '${PASSWORD}' where ID = ? and PASSWORD = ?`, [ID, OLD_PASSWORD],
                                connection,
                                (error, resultsUpdate1) => {
                                    if (error) {
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            statusCode: 400,
                                            message: "Failed to update PASSWORD!",
                                        });
                                    } else {
                                        mm.commitConnection(connection);
                                        res.send({
                                            statusCode: 200,
                                            message: "PASSWORD UPDATED SUCCSESFULLY.....",
                                        });

                                    }
                                }
                            );
                        } else {
                            mm.rollbackConnection(connection);
                            res.send({
                                statusCode: 400,
                                message: "invalid PASSWORD request ",
                            });
                        }
                    }
                }
            );
        } else {
            res.send({
                statusCode: 400,
                message: "NEW_PASSWORD parameter missing.",
            });
        }
    } catch (error) {
        console.log(error);
    }
};
