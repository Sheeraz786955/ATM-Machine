#! /usr/bin/env node
import inquirer from "inquirer";
import fs from "fs";
// array to store the data
let customers = [];
let currentCustomer = undefined;
// genrate rendon debitcard number
const GenerateRandomdDebtCardNumber = () => {
    const CardNumber = '4' + Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
    return CardNumber;
};
//console.log(GenerateRandomdDebtCardNumber())
// open account
const openAccount = async () => {
    const answers = await inquirer.prompt([{
            name: 'name',
            type: 'input',
            message: 'Please enter your name:',
            validate: (input) => {
                const existingCustomer = customers.find((c) => c.name === input);
                if (existingCustomer) {
                    return 'customer with this name already exists please try with a different name';
                }
                return true;
            },
        },
        {
            name: 'initialDeposit',
            type: 'input',
            message: 'Please enter your Initial Deposit amount:',
        },
        {
            name: 'pin',
            type: 'password',
            message: 'Please create your 4 digit pin:',
            validate: (Input) => {
                if (/^\d{4}$/.test(Input)) {
                    return true;
                }
                return 'Please enter a 4 digit pin:';
            },
        },
    ]);
    const newCustomer = {
        name: answers.name,
        debitCardNumber: GenerateRandomdDebtCardNumber(),
        Pin: parseInt(answers.pin, 10),
        balance: parseFloat(answers.initialDeposit),
    };
    customers.push(newCustomer);
    savenewcustomerdata(customers);
    console.log(` Mr. ${newCustomer.name} your account has been creates successfully`);
    console.log(`Your Debit Card Number: ${newCustomer.debitCardNumber}`);
    console.log(`Your account balance: ${newCustomer.balance.toFixed(2)}`);
    currentCustomer = newCustomer;
    atmManue();
};
// function to save new customer data in json file
const savenewcustomerdata = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync('customerData.json', jsonData, 'utf8');
};
// function to retrieve the customer data from json file
const retrieveCustomerData = () => {
    try {
        const jsonData = fs.readFileSync('customerData.json', 'utf8');
        return JSON.parse(jsonData);
    }
    catch (error) {
        return []; //if json doesn exite is return empoty array
    }
};
// user athentication function
const authenticateUser = async () => {
    console.log('Welcome to the ATM');
    const answer = await inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter your name',
        }
    ]);
    const existingCustomer = customers.find((c) => c.name === answer.name);
    if (existingCustomer) {
        const pinAnswer = await inquirer.prompt([
            {
                name: 'pin',
                type: 'password',
                message: 'Please create your 4 digit pin:',
                validate: (Input) => {
                    if (/^\d{4}$/.test(Input)) {
                        return true;
                    }
                    return 'Please enter a valid pin:';
                },
            },
        ]);
        if (existingCustomer.Pin === parseInt(pinAnswer.pin, 10)) {
            currentCustomer = existingCustomer;
            atmManue();
        }
        else {
            console.log(`Your Authentication is failed your pin is incorrect`);
            console.log(`Please try Again`);
            main();
        }
    }
    else {
        console.log(`Your Authentication is failed your are not a exiting customer`);
        console.log(`Please open an account and try again`);
        main();
    }
};
// ATN Manue or function
const atmManue = async () => {
    if (currentCustomer) {
        console.log(`Welcome Mr ${currentCustomer.name}`);
        console.log(`Your Debit Card No: ${currentCustomer.debitCardNumber}`);
        console.log(`Your account Balance : ${currentCustomer.balance.toFixed(2)}`);
        const answer = await inquirer.prompt([{
                name: 'choice',
                type: 'list',
                message: 'Please chose option',
                choices: ['withdraw', 'Deposit', 'Check Balance', 'Exit'],
            }
        ]);
        switch (answer.choice) {
            case 'withdraw':
                withdrawMoney();
                break;
            case 'Deposit':
                depositMoney();
                break;
            case 'Check Balance':
                // console.log(`Your account Balance : ${currentCustomer.balance.toFixed(2)}`)
                atmManue();
                break;
            case 'Exit':
                console.log(` Thank You for using this ATM`);
                break;
        }
    }
};
// impliment of withdraw and deposit operations
const withdrawMoney = async () => {
    const answer = await inquirer.prompt([
        {
            type: 'password',
            name: 'pins',
            message: 'Please enter your pin',
            validate: (Input) => {
                if (/^\d{4}$/.test(Input) && parseInt(Input, 10) === currentCustomer.Pin) {
                    return true;
                }
                return `Your Pin is incorrect. Please try again`;
            }
        },
        {
            type: 'input',
            name: 'amount',
            message: 'Please enter the withdrawal amount',
            validate: (Input) => {
                const amount = parseFloat(Input);
                if (isNaN(amount) || amount <= 0 || amount > currentCustomer.balance) {
                    return `Invalid amount please enter a correct amount:`;
                }
                return true;
            }
        }
    ]);
    const withdrawMoney = parseFloat(answer.amount);
    currentCustomer.balance -= withdrawMoney;
    savenewcustomerdata(customers);
    console.log(`Your withdraw successful your current Balance : ${currentCustomer.balance.toFixed(2)}`);
    atmManue();
};
const depositMoney = async () => {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'amount',
            message: 'Please enter the deposit amount',
            validate: (Input) => {
                const amount = parseFloat(Input);
                if (isNaN(amount) || amount <= 0) {
                    return `Invalid amount please enter a correct amount:`;
                }
                return true;
            }
        }
    ]);
    const withdrawMoney = parseFloat(answer.amount);
    currentCustomer.balance += withdrawMoney;
    savenewcustomerdata(customers);
    console.log(`Your Deposit successful your current Balance : ${currentCustomer.balance.toFixed(2)}`);
    atmManue();
};
const main = async () => {
    customers = retrieveCustomerData();
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: `Welcome to ATM , What do you want to do?`,
            choices: ['open an account', 'Authentication as existing user', 'Exit'],
        }
    ]);
    switch (answer.action) {
        case 'open an account':
            openAccount();
            break;
        case 'Authentication as existing user':
            authenticateUser();
            break;
        case 'Exit':
            console.log(` Thank you for using this ATM`);
            break;
    }
};
main();
