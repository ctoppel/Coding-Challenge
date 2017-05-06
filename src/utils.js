export const stringToDate = str => {
  if (str === '*') {
    return new Date(str);
  }

  const [month, year] = str.split('-');
  return new Date(`${month} 1 20${year}`);
}

export const dateToString = d => {
  if (isNaN(d.valueOf())) {
    return '*';
  }

  const [day, month, date, year, ...rest] = d.toString().split(' ');
  return `${month.toUpperCase()}-${year.slice(2, 4)}`
}

export const parseCSV = str => {
  let [headers, ...lines] = str.split(';\n');

  headers = headers.split(';');

  return lines.map(line => {
    return line
      .split(';')
      .reduce((acc, value, i) => {
        if (['ACCOUNT', 'DEBIT', 'CREDIT'].includes(headers[i])) {
          acc[headers[i]] = parseInt(value, 10);
        } else if (headers[i] === 'PERIOD') {
          acc[headers[i]] = stringToDate(value);
        } else {
          acc[headers[i]] = value;
        }
        return acc;
      }, {});
  });
}

export const toCSV = arr => {
  /* reorder to match CSV display order */
  let headers = Object.keys(arr[0])
  .slice(0, 1)
  .concat(Object.keys(arr[0])
  .slice(3, 4)
  .concat(Object.keys(arr[0])
  .slice(1, 3))
  .concat(Object.keys(arr[0])
  .slice(4)))
  .join(';');
  let lines = arr.map(obj => Object.values(obj)
  .slice(0, 1)
  .concat(Object.values(obj)
  .slice(3, 4)
  .concat(Object.values(obj)
  .slice(1, 3))
  .concat(Object.values(obj)
  .slice(4)))
  .join(';'));
  return [headers, ...lines].join(';\n');
}

export const parseUserInput = str => {
  let [
    startAccount, endAccount, startPeriod, endPeriod, format
  ] = str.split(' ');

  /* create numerical limits on '*' here or else all inputs become NaN after
  parseInt and can not be handled correctly in BalanceOutput.js */
  if (startAccount === '*') startAccount = 0;
  if (endAccount === '*') endAccount = 9999;

  return {
    startAccount: parseInt(startAccount, 10),
    endAccount: parseInt(endAccount, 10),
    startPeriod: stringToDate(startPeriod),
    endPeriod: stringToDate(endPeriod),
    format
  };
}
