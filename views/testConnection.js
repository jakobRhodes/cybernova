// Connects to the Oracle Cloud SQL database
// Loads the comments from the COMMENTS table.
//
var user = 'MERCANIST';
var password = 'CyberPunkLucy51!';
const oracledb = require('oracledb');
const connString = '(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-chicago-1.oraclecloud.com))(connect_data=(service_name=gc9da1e68817696_cybernovadatabase_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function run() {

    const connection = await oracledb.getConnection ({
        user          : user,
        password      : password,
        connectString : connString
    });

    const result = await connection.execute(`SELECT * FROM COMMENTS`);
    var data = result.rows
    console.log('Ran Successfully');
    await connection.close();
    console.log(data[0]['NAME']);
}
run();



