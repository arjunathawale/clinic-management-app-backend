const mm = require('../utilities/dbConfig');

var patientMaster = "patient_master";
var viewPatientMaster = "view_" + patientMaster;

function reqData(req) {
    var data = {
        DOCTOR_ID: req.body.DOCTOR_ID,
        PATIENT_NAME: req.body.PATIENT_NAME,
        ADDRESS: req.body.ADDRESS,
        MOBILE_NO: req.body.MOBILE_NO,
        FIRST_VISITDATETIME: mm.getSystemDate(),
        LAST_VISITDATETIME: mm.getSystemDate(),
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
        mm.runQuery('select count(*) as cnt from ' + viewPatientMaster + ' where 1 ' + countCriteria, (error, results1) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients count.",
                });
            } else {
                mm.runQuery('select * from ' + viewPatientMaster + ' where 1 ' + criteria, (error, results) => {
                    if (error) {
                        console.log(error);
                        res.send({
                            "statusCode": 400,
                            "message": "Failed to get patients."
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
        mm.runQueryData('INSERT INTO ' + patientMaster + ' SET ?', data, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save patients..."
                });
            }
            else {
                res.send({
                    "statusCode": 200,
                    "message": "Patient Created...!",
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
        mm.runQueryData(`UPDATE ` + patientMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to update patients."
                });
            }
            else {
                console.log(results);
                res.send({
                    "statusCode": 200,
                    "message": "Patient Updated...",
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}


exports.getAllPatient = (req, res) => {
    let filter = req.body.filter ? req.body.filter : ""
    try {
        mm.runQuery('select * from ' + viewPatientMaster + ' where 1 ' + filter, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients."
                });
            } else {
                res.send({
                    "statusCode": 200,
                    "message": "success",
                    "data": results
                });

            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.getDashboardCount = (req, res) => {
    let filter = req.body.filter ? req.body.filter : ""
    try {
        mm.runQuery(`SELECT COUNT( ID ) TODAY_PATIENT,ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS TODAY_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS TODAY_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS TODAY_DUE FROM patient_visit_log WHERE DATE ( VISIT_DATETIME ) = CURRENT_DATE ${filter};SELECT COUNT( ID ) YESTERDAY_PATIENT,ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS YESTERDAY_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS YESTERDAY_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS YESTERDAY_DUE FROM patient_visit_log WHERE DATE ( VISIT_DATETIME ) = DATE_SUB( CURRENT_DATE, INTERVAL 1 DAY) ${filter};SELECT COUNT( ID ) LAST7_PATIENT,ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS LAST7_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS LAST7_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS LAST7_DUE FROM patient_visit_log WHERE DATE ( VISIT_DATETIME ) BETWEEN DATE_SUB( CURRENT_DATE, INTERVAL 7 DAY ) AND CURRENT_DATE ${filter};SELECT COUNT( ID ) MONTH_PATIENT, ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS MONTH_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS MONTH_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS MONTH_DUE FROM patient_visit_log WHERE MONTH ( VISIT_DATETIME ) = MONTH ( CURRENT_DATE ) AND YEAR ( VISIT_DATETIME ) = YEAR ( CURRENT_DATE ) ${filter};`, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients."
                });
            } else {

                res.send({
                    "statusCode": 200,
                    "message": "success",
                    "data": [{
                        TODAY_DATA: results[0][0],
                        YESTERDAY_DATA: results[1][0],
                        LAST_7_DATA: results[2][0],
                        CMONTH_DATA: results[3][0],
                    }]
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.getTop10DueAmountPatient = (req, res) => {
    let filter = req.body.filter ? req.body.filter : ""

    try {
        mm.runQuery('SELECT ID, PATIENT_NAME, ADDRESS, MOBILE_NO, LAST_VISITDATETIME, DUE_AMOUNT, VISITED_COUNT FROM view_patient_master where 1 ' + filter + ' ORDER BY DUE_AMOUNT DESC LIMIT 10', (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients."
                });
            } else {
                res.send({
                    "statusCode": 200,
                    "message": "success",
                    "data": results
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.getPatientDetails = (req, res) => {
    let PATIENT_ID = req.body.PATIENT_ID
    try {
        // mm.runQueryData('SELECT ID, PATIENT_NAME, ADDRESS, MOBILE_NO, FIRST_VISITDATETIME, LAST_VISITDATETIME, (SELECT SUM(TOTAL_AMOUNT) FROM patient_visit_log WHERE PATIENT_ID = ?) AS TOTAL_AMOUNT,(SELECT SUM(PAID_AMOUNT) FROM patient_visit_log WHERE PATIENT_ID = ?) AS PAID_AMOUNT, (SELECT DISTINCT COUNT(ID) FROM patient_visit_log WHERE PATIENT_ID = ?) AS PAID_AMOUNT,  FROM view_patient_master WHERE ID = ?', [PATIENT_ID, PATIENT_ID, PATIENT_ID, PATIENT_ID], (error, results) => {
        mm.runQueryData('SELECT * FROM view_patient_master WHERE ID = ?', [PATIENT_ID], (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patient details"
                });
            } else {
                mm.runQueryData('SELECT * FROM patient_visit_log WHERE PATIENT_ID = ? order by VISIT_DATETIME desc limit 10', [PATIENT_ID], (error, results1) => {
                    if (error) {
                        console.log(error);
                        res.send({
                            "statusCode": 400,
                            "message": "Failed to get patient_visit_log."
                        });
                    } else {
                        res.send({
                            "statusCode": 200,
                            "message": "success",
                            "personalDetails": results,
                            "VisitDetails": results1
                        });
                    }
                })

            }
        });

    } catch (error) {
        console.log(error);
    }
}


exports.getDailyCount11 = (req, res) => {
    let filter = req.body.filter ? req.body.filter : ""
    try {
        mm.runQuery(`SELECT date(VISIT_DATETIME) as DATE, COUNT( ID ) TOTAL_PATIENT,ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS TOTAL_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS TOTAL_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS TOTAL_DUE FROM patient_visit_log WHERE 1 ${filter};`, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients."
                });
            } else {
                res.send({
                    "statusCode": 200,
                    "message": "success",
                    "data": results
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}
exports.getDailyCount = (req, res) => {

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
        // mm.runQuery('select count(*) as cnt from ' + viewPatientMaster + ' where 1 ' + countCriteria, (error, results1) => {
        //     if (error) {
        //         console.log(error);
        //         res.send({
        //             "statusCode": 400,
        //             "message": "Failed to get patients count.",
        //         });
        //     } else {
        mm.runQuery('SELECT date(VISIT_DATETIME) as DATE, COUNT( ID ) TOTAL_PATIENT,ifnull( SUM( TOTAL_AMOUNT ), 0 ) AS TOTAL_AMOUNT,ifnull( SUM( PAID_AMOUNT ), 0 ) AS TOTAL_PAID,ifnull( SUM( TOTAL_AMOUNT - PAID_AMOUNT ), 0 ) AS TOTAL_DUE FROM patient_visit_log WHERE 1 ' + criteria, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patients."
                });
            }
            else {
                res.send({
                    "statusCode": 200,
                    "message": "success",
                    "data": results
                });
            }
        });
        //     }
        // });
    } catch (error) {
        console.log(error);
    }
}


exports.deletePatientEntry = (req, res) => {

    var data = reqData(req);
    let splitDate = mm.getSystemDate().split(" ")[1]
    let DOCTOR_ID = req.body.DOCTOR_ID
    let PATIENT_ID = req.body.PATIENT_ID
    let ROW_ID = req.body.ROW_ID
    try {
        const connection = mm.openConnection()
        mm.runDML('SELECT ID,VISIT_DATETIME FROM patient_visit_log WHERE PATIENT_ID = ? AND DOCTOR_ID = ? order by VISIT_DATETIME desc', [PATIENT_ID, DOCTOR_ID], connection, (error, results) => {
            if (error) {
                console.log(error);
                mm.rollbackConnection(connection)
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save patients..."
                });
            } else {
                console.log(results.length);
                if (results.length == 1) {
                    mm.runDML('DELETE FROM patient_master where ID = ? AND DOCTOR_ID = ?', [PATIENT_ID, DOCTOR_ID], connection, (error, resultSave) => {
                        if (error) {
                            console.log(error);
                            mm.rollbackConnection(connection)
                            res.send({
                                "statusCode": 400,
                                "message": "Failed to delete patient..."
                            });
                        } else {
                            mm.runDML('DELETE FROM patient_visit_log where ID = ? AND PATIENT_ID = ? AND DOCTOR_ID = ?', [ROW_ID, PATIENT_ID, DOCTOR_ID], connection, (error, resultDelete) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "statusCode": 400,
                                        "message": "Failed to delete patient..."
                                    });
                                } else {
                                    mm.commitConnection(connection)
                                    res.send({
                                        "statusCode": 200,
                                        "message": "Patient Entry Deleted...!",
                                    });
                                }
                            })

                        }
                    });
                } else if (results.length > 1) {
                    mm.runDML('UPDATE ' + patientMaster + ' SET LAST_VISITDATETIME = ? WHERE ID = ?', [results[1].VISIT_DATETIME, PATIENT_ID], connection, (error, resultSave) => {
                        if (error) {
                            console.log(error);
                            mm.rollbackConnection(connection)
                            res.send({
                                "statusCode": 400,
                                "message": "Failed to save patients..."
                            });
                        } else {
                            mm.runDML('DELETE FROM patient_visit_log where ID = ? AND PATIENT_ID = ? AND DOCTOR_ID = ?', [ROW_ID, PATIENT_ID, DOCTOR_ID], connection, (error, resultDelete) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "statusCode": 400,
                                        "message": "Failed to delete patient..."
                                    });
                                } else {
                                    mm.commitConnection(connection)
                                    res.send({
                                        "statusCode": 200,
                                        "message": "Patient Entry Deleted...!",
                                    });
                                }
                            })
                        }
                    });
                } else {
                    mm.commitConnection(connection)
                    res.send({
                        "statusCode": 200,
                        "message": "Patient Not Found...!",
                    });
                }

            }
        })

    } catch (error) {
        console.log(error)
    }

}

exports.createPatientEntry = (req, res) => {
    var data = reqData(req);
    let splitDate = mm.getSystemDate().split(" ")[1]
    let [day, month, year] = req.body.VISIT_DATETIME.split("/")
    let newDate = year + '-' + month + '-' + day + ' ' + splitDate
    let DOCTOR_ID = req.body.DOCTOR_ID
    let PATIENT_ID = req.body.PATIENT_ID
    let PATIENT_RELATION = req.body.PATIENT_RELATION
    let DESCRIPTION = req.body.DESCRIPTION
    data.FIRST_VISITDATETIME = newDate
    data.LAST_VISITDATETIME = newDate
    let TOTAL_AMOUNT = req.body.TOTAL_AMOUNT
    let PAID_AMOUNT = req.body.PAID_AMOUNT
    console.log("req", req.body);
    try {
        const connection = mm.openConnection()
        mm.runDML('SELECT ID FROM patient_master WHERE ID = ? AND DOCTOR_ID = ?', [PATIENT_ID, DOCTOR_ID], connection, (error, results) => {
            if (error) {
                console.log(error);
                mm.rollbackConnection(connection)
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save patients..."
                });
            } else {
                if (results.length > 0) {
                    mm.runDML('UPDATE ' + patientMaster + ' SET PATIENT_NAME = ?, ADDRESS = ?, MOBILE_NO = ?, LAST_VISITDATETIME = ? WHERE ID = ?', [data.PATIENT_NAME, data.ADDRESS, data.MOBILE_NO, newDate, results[0].ID], connection, (error, resultSave) => {
                        if (error) {
                            console.log(error);
                            mm.rollbackConnection(connection)
                            res.send({
                                "statusCode": 400,
                                "message": "Failed to save patients..."
                            });
                        } else {
                            mm.runDML('INSERT INTO patient_visit_log (PATIENT_ID,DOCTOR_ID, PATIENT_RELATION,DESCRIPTION,VISIT_DATETIME,TOTAL_AMOUNT,PAID_AMOUNT) values (?,?,?,?,?,?,?)', [PATIENT_ID, DOCTOR_ID, PATIENT_RELATION, DESCRIPTION, newDate, TOTAL_AMOUNT, PAID_AMOUNT], connection, (error, resultSave1) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "statusCode": 400,
                                        "message": "Failed to save patients log..."
                                    });
                                } else {
                                    mm.commitConnection(connection)
                                    res.send({
                                        "statusCode": 200,
                                        "message": "Patient Created...!",
                                    });
                                }
                            })

                        }
                    });
                } else {
                    mm.runDML('INSERT INTO ' + patientMaster + ' SET ?', data, connection, (error, resultSave) => {
                        if (error) {
                            console.log(error);
                            mm.rollbackConnection(connection)
                            res.send({
                                "statusCode": 400,
                                "message": "Failed to save patients..."
                            });
                        } else {
                            PATIENT_ID = resultSave.insertId
                            mm.runDML('INSERT INTO PATIENT_VISIT_LOG (PATIENT_ID, DOCTOR_ID, PATIENT_RELATION,DESCRIPTION,VISIT_DATETIME,TOTAL_AMOUNT,PAID_AMOUNT) values (?,?,?,?,?,?,?)', [PATIENT_ID, DOCTOR_ID, PATIENT_RELATION, DESCRIPTION, newDate, TOTAL_AMOUNT, PAID_AMOUNT], connection, (error, resultSave) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "statusCode": 400,
                                        "message": "Failed to save patients log..."
                                    });
                                } else {
                                    mm.commitConnection(connection)
                                    res.send({
                                        "statusCode": 200,
                                        "message": "Patient Created...!",
                                    });
                                }
                            })

                        }
                    });
                }

            }
        })

    } catch (error) {
        console.log(error)
    }

}

exports.updatePatientEntry = (req, res) => {
    var data = reqData(req);
    let splitDate = mm.getSystemDate().split(" ")[1],
        [day, month, year] = req.body.VISIT_DATETIME.split("/"),
        newDate = year + '-' + month + '-' + day + ' ' + splitDate,
        ID = req.body.ID,
        DOCTOR_ID = req.body.DOCTOR_ID,
        PATIENT_ID = req.body.PATIENT_ID,
        PATIENT_RELATION = req.body.PATIENT_RELATION,
        DESCRIPTION = req.body.DESCRIPTION,
        TOTAL_AMOUNT = req.body.TOTAL_AMOUNT,
        PAID_AMOUNT = req.body.PAID_AMOUNT



    try {
        const connection = mm.openConnection()
        mm.runDML('SELECT ID FROM patient_master WHERE ID = ? AND DOCTOR_ID = ?', [PATIENT_ID, DOCTOR_ID], connection, (error, results) => {
            if (error) {
                console.log(error);
                mm.rollbackConnection(connection)
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save patients..."
                });
            } else {
                if (results.length > 0) {
                    mm.runDML('UPDATE ' + patientMaster + ' SET LAST_VISITDATETIME = ?, PATIENT_NAME = ?, ADDRESS = ?, MOBILE_NO = ? WHERE ID = ? ', [newDate, data.PATIENT_NAME, data.ADDRESS, data.MOBILE_NO, results[0].ID], connection, (error, resultSave) => {
                        if (error) {
                            console.log(error);
                            mm.rollbackConnection(connection)
                            res.send({
                                "statusCode": 400,
                                "message": "Failed to save patients..."
                            });
                        } else {
                            mm.runDML('UPDATE patient_visit_log SET VISIT_DATETIME = ?, PATIENT_RELATION = ?,DESCRIPTION = ?,TOTAL_AMOUNT = ?,PAID_AMOUNT = ? WHERE ID = ? AND PATIENT_ID = ? AND DOCTOR_ID = ?', [newDate, PATIENT_RELATION, DESCRIPTION, TOTAL_AMOUNT, PAID_AMOUNT, ID, PATIENT_ID, DOCTOR_ID], connection, (error, resultSave1) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "statusCode": 400,
                                        "message": "Failed to save patients log..."
                                    });
                                } else {
                                    mm.commitConnection(connection)
                                    res.send({
                                        "statusCode": 200,
                                        "message": "Patient Updated...!",
                                    });
                                }
                            })
                        }
                    });
                } else {
                    mm.commitConnection(connection)
                    res.send({
                        "statusCode": 400,
                        "message": "Patient Not Found...!",
                    });
                }
            }
        })
    } catch (error) {
        console.log(error)
    }

}
