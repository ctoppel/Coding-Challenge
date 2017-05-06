import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as utils from '../utils';

class BalanceOutput extends Component {
  render() {
    if (!this.props.userInput.format) {
      return null;
    }

    return (
      <div className='output'>
        <p>
          Total Debit: {this.props.totalDebit} Total Credit: {this.props.totalCredit}
          <br />
          Balance from account {this.props.userInput.startAccount || '*'}
          {' '}
          to {this.props.userInput.endAccount || '*'}
          {' '}
          from period {utils.dateToString(this.props.userInput.startPeriod)}
          {' '}
          to {utils.dateToString(this.props.userInput.endPeriod)}
        </p>
        {this.props.userInput.format === 'CSV' ? (
          <pre>{utils.toCSV(this.props.balance)}</pre>
        ) : null}
        {this.props.userInput.format === 'HTML' ? (
          <table className="table">
            <thead>
              <tr>
                <th>ACCOUNT</th>
                <th>DESCRIPTION</th>
                <th>DEBIT</th>
                <th>CREDIT</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {this.props.balance.map((entry, i) => (
                <tr key={i}>
                  <th scope="row">{entry.ACCOUNT}</th>
                  <td>{entry.DESCRIPTION}</td>
                  <td>{entry.DEBIT}</td>
                  <td>{entry.CREDIT}</td>
                  <td>{entry.BALANCE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  }
}

BalanceOutput.propTypes = {
  balance: PropTypes.arrayOf(
    PropTypes.shape({
      ACCOUNT: PropTypes.number.isRequired,
      DESCRIPTION: PropTypes.string.isRequired,
      DEBIT: PropTypes.number.isRequired,
      CREDIT: PropTypes.number.isRequired,
      BALANCE: PropTypes.number.isRequired
    })
  ).isRequired,
  totalCredit: PropTypes.number.isRequired,
  totalDebit: PropTypes.number.isRequired,
  userInput: PropTypes.shape({
    startAccount: PropTypes.number,
    endAccount: PropTypes.number,
    startPeriod: PropTypes.date,
    endPeriod: PropTypes.date,
    format: PropTypes.string
  }).isRequired
};

export default connect((state) => {
  let balance = [];

  console.log(state.userInput.startAccount, state.userInput.endAccount);

  /* create copies so start and end accounts are not mutated if the code below
  is used */
  let startAccount = state.userInput.startAccount;
  let endAccount = state.userInput.endAccount;

  /* set lowest and highest limits of accounts when a non-number is used
  (parseInt in utils prevents '*' to be specified here. If only code should be
  added here, then the following 2 lines should be used instead of the code in
  utils.js) */
  // if (Number.isNaN(startAccount)) startAccount = 0;
  // if (Number.isNaN(endAccount)) endAccount = 9999;

  /* filter the journal entries based on the criteria set by the user */
  const filteredJournalEntries = state.journalEntries
    .filter(entry => entry.PERIOD >= state.userInput.startPeriod &&
      entry.PERIOD <= state.userInput.endPeriod &&
      entry.ACCOUNT >= startAccount &&
      entry.ACCOUNT <= endAccount);

  filteredJournalEntries.forEach((entry) => {
    /* create a copy of each entry so that the entries are not mutated */
    const balanceEntry = { ...entry };

    /* create a boolean that indicates whether an account is already in balance
    or not */
    let accountExists = false;

    /* remove period so csv format does not show */
    delete balanceEntry.PERIOD;

    /* add description for each account in balance based on corresponding labels
    in accounts data */
    state.accounts.forEach((account) => {
      if (account.ACCOUNT === balanceEntry.ACCOUNT) {
        balanceEntry.DESCRIPTION = account.LABEL;
      }
    });

    /* calculate balance of the account based on the difference between the
    account credit and the debit */
    balanceEntry.BALANCE = balanceEntry.CREDIT - balanceEntry.DEBIT;

    /* if account already exists in balance, adjust total debit, credit, and
    balance of that account */
    balance.forEach((account) => {
      if (account.ACCOUNT === balanceEntry.ACCOUNT) {
        accountExists = true;
        account.DEBIT += balanceEntry.DEBIT;
        account.CREDIT += balanceEntry.CREDIT;
        account.BALANCE += balanceEntry.BALANCE;
      }
    });

    /* only add a new account if it doesn't already exist in balance */
    if (!accountExists) balance.push(balanceEntry);
  });

  /* sort balance based on account numbers starting with lowest first */
  balance = balance.sort((a, b) => a.ACCOUNT - b.ACCOUNT);

  const totalCredit = balance.reduce((acc, entry) => acc + entry.CREDIT, 0);
  const totalDebit = balance.reduce((acc, entry) => acc + entry.DEBIT, 0);

  return {
    balance,
    totalCredit,
    totalDebit,
    userInput: state.userInput
  };
})(BalanceOutput);
