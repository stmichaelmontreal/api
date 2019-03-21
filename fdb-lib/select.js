const moment = require('moment');

const rx = require('rxjs');
const rxO = require('rxjs/operators');

const winston = require('winston');
const logger = winston.loggers.get('fdb');

const path = require('path');
const wrud = require(path.join(__dirname, 'wrud'));

class Where {
    constructor(field, operator, value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
}

function select(dirName, filter) {
    //logger.info({action: 'select', dirName: dirName, filter: filter});
    let sType = 'NONE';
    let id;
    let top;
    let orderBy;
    let where;
    //rx.of(isID)
    if (filter.hasOwnProperty('id')) {
        id = filter.id.substring(0, 36);
        sType = 'ONE';
    } else if (filter.hasOwnProperty('where')
    // && filter.hasOwnProperty('orderBy')
    // && filter.hasOwnProperty('where')
    ) {
        orderBy = filter.orderBy;
        top = parseInt(filter.top);
        where = filter.where;
        sType = 'MORE';
    }
    if (sType === 'ONE') {
        return wrud.readFile(dirName, id).pipe(
            rxO.switchMap((data) => rx.of(data ? [data] : []))
        );
    }
    if (sType === 'MORE') {
        return wrud.readDir(dirName).pipe(
            rxO.switchMap((data) => {
                // console.log(data);
                return rx.of(data.filter(filterWhere.bind(this, where)));
            })
        );
    }
    return rx.of([]);
}

function filterWhere(where, element) {
    if (element[where.field]) {
        switch (where.operator) {
            case 'str_equal':
                return element[where.field] === where.value;
            case 'str_not_equal':
                return element[where.field] !== where.value;
            case 'str_regex':
                const regex = new RegExp(where.value);
                return regex.test(element[where.field]);
            case 'str_contains':
                return element[where.field].indexOf(where.value);

            // number
            case 'num_equal':
                return element[where.field] === where.value;
            case 'num_not_equal':
                return element[where.field] !== where.value;
            case 'num_greater':
                return element[where.field] > where.value;
            case 'num_less':
                return element[where.field] < where.value;

            // date
            //TODO - improve performance predefine mVal = moment(where.value)
            case 'date_equal':
                return moment(element[where.field]).isSame(where.value);
            case 'date_before':
                return moment(element[where.field]).isBefore(where.value);
            case 'date_after':
                return moment(element[where.field]).isAfter(where.value);
            case 'date_same_or_before':
                return moment(element[where.field]).isSameOrBefore(where.value);
            case 'date_same_or_after':
                return moment(element[where.field]).isSameOrAfter(where.value);
            case 'date_between':
                return moment(element[where.field]).isBetween(where.value['d1'], where.value['d2']);

            default:
                return false;
        }
    }
    return element > where;
}

module.exports.select = select;
module.exports.Where = Where;
