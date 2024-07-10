const mm = require('../utilities/dbConfig');

var patientVisitLog = "patient_visit_log";
var viewPatientVisitLog = "view_" + patientVisitLog;

function reqData(req) {
    var data = {
        PATIENT_ID: req.body.PATIENT_ID,
        PATIENT_RELATION: req.body.PATIENT_RELATION,
        DESCRIPTION: req.body.DESCRIPTION,
        VISIT_DATETIME: req.body.VISIT_DATETIME,
        TOTAL_AMOUNT: req.body.TOTAL_AMOUNT,
        PAID_AMOUNT: req.body.PAID_AMOUNT
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
        mm.runQuery('select count(*) as cnt from ' + viewPatientVisitLog + ' where 1 ' + countCriteria, (error, results1) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to get patientVisitLog count.",
                });
            } else {
                mm.runQuery('select * from ' + viewPatientVisitLog + ' where 1 ' + criteria, (error, results) => {
                    if (error) {
                        console.log(error);
                        res.send({
                            "statusCode": 400,
                            "message": "Failed to get patientVisitLog."
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
        mm.runQueryData('INSERT INTO ' + patientVisitLog + ' SET ?', data, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to save patientVisitLog..."
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
        mm.runQueryData(`UPDATE ` + patientVisitLog + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, (error, results) => {
            if (error) {
                console.log(error);
                res.send({
                    "statusCode": 400,
                    "message": "Failed to update patientVisitLog."
                });
            }
            else {
                console.log(results);
                res.send({
                    "statusCode": 200,
                    "message": "patientVisitLog Updated...",
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}
