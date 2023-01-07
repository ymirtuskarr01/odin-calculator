"strict"

let buttons = document.querySelectorAll("button");
let display = document.querySelectorAll(".div-display input");
// select operation symbol aside from dot
let regexNumberSplit = /[^0-9\.\s)]/;
let regexNumberOperationSplit = /([^0-9\.\s)])/;
let operation = {
    "/": "/",
    "X": "X",
    "+": "+",
    "-": "-",
}

for (let element in Array.from(buttons)) {
    
    buttons[element].addEventListener("click", event => {
        handleClick(event);
        event.stopPropagation();
    });
}

function handleClick(event) {
    event.stopPropagation();

    let button = event.target;

    if (button.tagName.toLowerCase() == "img") {
        button = event.target.parentNode;
    }

    if (button.getAttribute("value") == "clear") {
        display[0].value = "";
        display[1].value = "";
        return;
    }

    if (button.getAttribute("value") == "delete") {
        display[0].value = display[0].value.slice(0,display[0].value.length-1);

        let displayedValue = display[0].value.replaceAll("X", "*").split(regexNumberOperationSplit)
                                .filter(value => value != "");
        if (displayedValue.length > 2) {
            // differentiate first value has -1 or no
            displayedValue = checkNegativeValue(displayedValue);

            const result = calculate(displayedValue, displayedValue.length);
            display[1].value = result;
        } else {
            display[1].value = "";
        }
        return;
    }

    if (button.getAttribute("value") == "=") {
        let displayedValue = display[0].value.replaceAll("X", "*").split(regexNumberOperationSplit)
                                .filter(value => value != "")

        if (displayedValue.length > 2) {
            // differentiate first value has -1 or no
            displayedValue = checkNegativeValue(displayedValue);

            const result = calculate(displayedValue, displayedValue.length);
            display[0].value = result;
        }
        display[1].value = "";
    }
    else if (button.getAttribute("value") == ".") {
        const displayedValue = display[0].value.split(regexNumberSplit);
        displayedValue.filter((value, i) => {
            if (i == displayedValue.length -1) {
                
                if (value.indexOf(".") == 0) {
                    return;
                }

                if ((value.match(/\./gi) || []).length > 0) {
                    return;
                }
                return display[0].value = display[0].value + button.getAttribute("value");
            }
        });
    }
    else if (button.getAttribute("value") == "/" || button.getAttribute("value") == "X" || button.getAttribute("value") == "-" || button.getAttribute("value") == "+") {

        if (display[0].value.length < 1 && button.getAttribute("value") != "-") {
            return;
        }

        if (display[0].value.length < 2 && display[0].value[0] == "-" && button.getAttribute("value") != "+") {
            return;
        }
  
        if (display[0].value.length < 2 && display[0].value[0] == "-" && button.getAttribute("value") == "+") {
            display[0].value = "";
            return;
        }
        let lastValue = display[0].value.slice(display[0].value.length - 1, display[0].value.length);
        let lastTwoValue = display[0].value.slice(display[0].value.length - 2, display[0].value.length);

        if ((lastTwoValue == "X-" || lastTwoValue == "/-") && button.getAttribute("value") != "-") {
            // remove last operation sign
            display[0].value = display[0].value.slice(0, display[0].value.length-2) + button.getAttribute("value");
            return;
        }

        if (operation[lastValue]) {
            if ((lastValue == "X" || lastValue == "/") && button.getAttribute("value") == "-") {
                // add - sign to multiply and divisiono
                display[0].value = display[0].value + button.getAttribute("value");
                return;
            }
    
            // change operation sign
            display[0].value = display[0].value.slice(0, display[0].value.length-1) + button.getAttribute("value");
            return;
        }
        // write initial to display
        display[0].value = display[0].value + button.getAttribute("value");
    }
    else {
        display[0].value = display[0].value + button.getAttribute("value");

        let displayedValue = display[0].value.replaceAll("X", "*").split(regexNumberOperationSplit)
                                .filter(value => value != "");

        displayedValue = displayedValue.map((value, index, array) => {
                            if (index == displayedValue.length -1) {
                                if (value.indexOf("0") == 0 && value.length > 1 && value.indexOf("0.") != "0") {
                                    if (button.getAttribute("value") == "0") {
                                        value = value.slice(0, value.length-1)
                                    } else {
                                        value = value.slice(1, value.length);
                                        // display[0].value = display[0].value.slice(1, display[0].value.length);
                                    }
                                    //canWrite = preventMultipleLeadingZero(button);
                                    //return canWrite = true ? value : "";
                                }
                            }
                            return value;
                         })

        display[0].value = displayedValue.join("").replaceAll("*","X");

        if (displayedValue.length > 2) {

            // differentiate first value has -1 or no
            displayedValue = checkNegativeValue(displayedValue);

            const result = calculate(displayedValue, displayedValue.length);
            display[1].value = result;
        }
    }
}

function calculate(arrays, arrLength) {
    let toCalculate;

    // handles last value is operation sign
    if (operation[arrays[arrLength-1]]) {
        arrays.splice(arrLength - 1, 1);
        arrLength = arrays.length;
    }

    if (arrLength < 4) {
        switch(arrays[1]) {
            case "*":
                toCalculate = Number(arrays[0]) * Number(arrays[2]);
                break;
            case "/":
                toCalculate = Number(arrays[0]) / Number(arrays[2]);
                break;
            case "+":
                toCalculate = Number(arrays[0]) + Number(arrays[2]);
                break;
            case "-":
                toCalculate = Number(arrays[0]) - Number(arrays[2]);
                break;
        }    
    } else {
        let valueToCalculate = arrays;
        let priority = valueToCalculate.findIndex(findThis => 
            findThis == "*" || findThis == "/"
        );

        if (priority != -1) {
            if (valueToCalculate[priority] == "*") {
                let solveFirst = Number(valueToCalculate[priority-1]) * Number(valueToCalculate[priority + 1]);

                valueToCalculate = valueToCalculate.filter((value, j) => 
                    (j != priority -1 && j != priority && j != priority + 1)
                );
            
                valueToCalculate.splice(priority - 1, 0, solveFirst);
            } else if (valueToCalculate[priority] == "/") {
                let solveFirst = Number(valueToCalculate[priority-1]) / Number(valueToCalculate[priority + 1]);

                valueToCalculate = valueToCalculate.filter((value, j) => 
                    (j != priority -1 && j != priority && j != priority + 1)
                );

                valueToCalculate.splice(priority - 1, 0, solveFirst);
            }

        } else {
            if (valueToCalculate[1] == "+") {
                let solveFirst = Number(valueToCalculate[0]) + Number(valueToCalculate[2]);

                valueToCalculate = valueToCalculate.filter((value, index) => 
                    (index != 0 && index != 1 && index != 2)               
                );

                valueToCalculate.splice(0, 0, solveFirst);
            } else if (valueToCalculate[1] == "-") {
                let solveFirst = Number(valueToCalculate[0]) - Number(valueToCalculate[2]);

                valueToCalculate = valueToCalculate.filter((value, index) => 
                    (index != 0 && index != 1 && index != 2)               
                );

                valueToCalculate.splice(0, 0, solveFirst);
            }
        }
        
        toCalculate = calculate(valueToCalculate, valueToCalculate.length);
    }

    return toCalculate;
}

function checkNegativeValue(arrays) {
    let indexOfNegative = arrays.map((value, index) => {
        if (value == "-") {
            let valueBeforeNegative = arrays[index -1];
            if (valueBeforeNegative == "*" || valueBeforeNegative == "/"){
               // value[index+1] = "-"+value[index+1];
                return index;
            }

            if (index == 0) return index;
        }
    }).filter(value => typeof value != "undefined");

    let newArrays = JSON.parse(JSON.stringify(arrays));
    for(let i = 0; i < indexOfNegative.length; i++) {
        newArrays.splice(indexOfNegative[i] - i, 1);
        newArrays.splice(indexOfNegative[i] - i, 1, "-" + newArrays[indexOfNegative[i] - i]);
    }

    return newArrays;
}

function round(value, decimals) {
    return Number (Math.round(value + 'e' + decimals) + 'e-' + decimals);
}