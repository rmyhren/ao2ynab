import _ from "lodash";
import moment from 'moment'; 


const OFX_HEADER = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE
<OFX>
    <SIGNONMSGSRSV1>
        <SONRS>
            <STATUS>
                <CODE>0</CODE>
                <SEVERITY>INFO</SEVERITY>
            </STATUS>
            <DTSERVER>{{end_date_now}}</DTSERVER>
            <LANGUAGE>NO</LANGUAGE>
            <FI>
                <ORG>{{organization}}</ORG>
            </FI>
        </SONRS>
    </SIGNONMSGSRSV1>
    <BANKMSGSRSV1>
        <STMTTRNRS>
            <TRNUID>1</TRNUID>
            <STATUS>
                <CODE>0</CODE>
                <SEVERITY>INFO</SEVERITY>
            </STATUS>
            <STMTRS>
            <CURDEF>NOK</CURDEF>
            <BANKACCTFROM>
                <BANKID>{{bankid}}</BANKID>
                <ACCTID>{{accountid}}</ACCTID>
                <ACCTTYPE>CHECKING</ACCTTYPE>
            </BANKACCTFROM>
            <BANKTRANLIST>
            {{transactions}}
            </BANKTRANLIST>
                <LEDGERBAL>
                    <BALAMT>17752.42</BALAMT>
                    <DTASOF>20130930</DTASOF>
                </LEDGERBAL>
            </STMTRS>
        </STMTTRNRS>
    </BANKMSGSRSV1>
</OFX>
`;

const OFX_TRANSACTION = `
<STMTTRN>
    <TRNTYPE>OTHER</TRNTYPE>
    <DTPOSTED>{{date}}</DTPOSTED>
    <TRNAMT>{{amount}}</TRNAMT>
    <FITID>{{id}}</FITID>
    <NAME>{{name}}</NAME>
    <MEMO>{{memo}}</MEMO>
</STMTTRN>`;


function getName(rowData) {
    let name = "Unknown";

    if (rowData[2] && rowData[2].length > 0) {
        name = rowData[2]
        name = name.replace(/\bVarekjøp[.\s]\s?/i, "");
        name = name.replace(/\bAvtalegiro til[.\s]\s?/i, "");
        name = name.replace(/\bOverført til[.\s]\s?/i, "");
        name = name.replace(/\bGiro - Melding -[.\s]\s?/i, "");
        name = name.substr(0,31);
    }

    return _.startCase(_.lowerCase(name));
}

function amountToFloat(amount){
    amount = amount.replace(".","")
    amount = amount.replace(",",".")
    return amount
}


function generateOfx(csvRows, account) {
    let ofxTransactions = "";
    var startDate = moment(new Date());
    var endDate = startDate;
    var organization = 'Arendal & Omegn Sparekasse';
    var bankid = "SPAREKASSEN";
    let header = "";

    for (let index = 0; index < csvRows.length; index++) {
        let rowData = csvRows[index];
        if(rowData[0] !== ""){
        var tdate = moment(rowData[0], 'DD.MM.YYYY');
        if(tdate.isSameOrBefore(startDate)){
            startDate = tdate
        }
        if(tdate.isSameOrAfter(endDate)){
            endDate = tdate
        }
        ofxTransactions += OFX_TRANSACTION
            .replace("{{date}}", tdate.format('YYYYMMDD').toString())
            .replace("{{amount}}", amountToFloat(csvRows[index][3]))
            .replace("{{id}}", index)
            .replace("{{name}}", getName(rowData))
            .replace("{{memo}}", rowData[2]);
        }
    }
    var end_date_now = endDate.format('YYYYMMDD').toString();


    header = OFX_HEADER
    .replace("{{end_date_now}}", end_date_now)    
    .replace("{{organization}}", organization)
    .replace("{{bankid}}", bankid)    
    .replace("{{accountid}}", account)
    .replace("{{transactions}}", ofxTransactions);

    var sDate = startDate.format('YYYYMMDD').toString();
    var eDate = endDate.format('YYYYMMDD').toString();
    return {header,sDate, eDate, account, bankid}
}


export default generateOfx;