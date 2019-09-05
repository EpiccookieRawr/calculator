const dataCtrl = (function(){
    const dictionary = {
        'operator' : ['*', '-', '+', '/'],
        'number' : ['1','2','3','4','5','6','7','8','9','0', '.'],
        'functions' : ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'pow'],
        'functionsTwoParams' : ['^'],
        'constants' : ['PI', 'E', 'Ans'],
        'brackets' : ['(', ')']
    }

    const translation = {
        'sin' : 'Math.sin',
        'cos' : 'Math.cos',
        'tan' : 'Math.tan',
        'ln' : 'Math.log',
        'sqrt' : 'Math.sqrt',
        'log' : '1/Math.LN10*Math.log',
        'PI' : 'Math.PI',
        'E' : 'Math.E',
        'pow' : 'Math.pow',
    }

    const dictionaryRules = {
        'operator' : {
            'correctInputs' : ['number', 'functions', 'brackets', 'functionsTwoParams', 'operator', 'constants']
        },
        'number' :{
            'correctInputs' : ['number', 'functions', 'decimals', 'operator', 'brackets', 'functionsTwoParams', 'constants']
        },
        'functions' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets']
        },
        'functionsTwoParams' : {
            'correctInputs' : ['number', 'functions', 'constants', 'brackets', 'functionsTwoParams']
        },
        'constants' : {
            'correctInputs' : ['number', 'functions', 'operator', 'brackets', 'functionsTwoParams', 'constants']
        },
        'brackets' : {
            'correctInputs' : ['number', 'functions', 'constants', 'brackets', 'functionsTwoParams', 'operator']
        }
    }

    const insertFunctionMethod = {
        '^' : function(equation, indexes) {
            if(indexes.length > 0) {
                equation.splice(indexes[0], 1, ',');
                equation.splice(indexes[1], 0, 'pow', '(');
                equation.splice(indexes[2], 0, ')');
            }
            return equation;
        }
    }

    const data = {
        'equation' : [],
        'currentType' : null,
        'currentRules' : {
            'acceptedInputs' : null,
        },
        'answer' : 1,
    }

    const getEquation = function() {
        return data.equation;
    }

    const addInput = function(input) {
        if(input === '=') return true;

        for(let type in dictionary) {
            if(dictionary[type].indexOf(input) !== -1) {
                if(data.currentRules.acceptedInputs !== null) {
                    if(data.currentRules.acceptedInputs.indexOf(type) === -1) return false;
                }

                if(data.equation.length === 0) {
                    if(['-', '+', '/', ...dictionary.functionsTwoParams].indexOf(type) !== -1) return false;
                }

                if(dictionaryRules[type]) {
                    switch(type) {
                        case 'operator' :
                            if(data.currentInputType === 'operator') {
                                if(data.equation.length == 1) return false;
                                data.equation[data.equation.length - 1] = input;
                            } else {
                                data.equation.push(input);
                            }
                            break;
                        case 'functions' :
                        case 'functionsTwoParams' :
                            data.equation.push(input, '(');
                            break;
                        default:
                            data.equation.push(input);
                    }

                    data.currentInputType = type;
                    data.currentRules.acceptedInputs = dictionaryRules[type].correctInputs;
                }
            }
        }
        // console.log(data.equation);
        return true;
    }

    const evalEquation = function() {
        let insert = [];
        let finalEquation = [];
        let missingBrackets = 0;

        data.equation.forEach((equationElement) => {
            if(equationElement === '(') {
                missingBrackets++;
            } else if(equationElement === ')') {
                missingBrackets--;
            }
        });

        if(missingBrackets !== 0) data.equation.push(...Array(missingBrackets).fill(')'));

        data.equation.forEach((equationElement, equationIndex) => {
            if(dictionary.functionsTwoParams.indexOf(equationElement) !== -1) {
                let bracketCount = 0;
                let stopIndex = 0;
                let numberCount;
                let beginningIndex = 0;
                const insertFunction = {
                    type : equationElement,
                    indexes : [equationIndex]
                };
                if([...dictionary.constants,...dictionary.number].indexOf(data.equation[equationIndex - 1]) !== -1) {
                    stopIndex = 1;
                    numberCount = 0;
                    while([...dictionary.constants,...dictionary.number].indexOf(data.equation[equationIndex - stopIndex]) !== -1) {
                        numberCount++;
                        stopIndex++;
                    }
                    insertFunction.indexes.push(equationIndex - numberCount);
                } else {
                    bracketCount = 1;
                    stopIndex = 1;
                    if(dictionary.brackets.indexOf(data.equation[equationIndex - stopIndex]) !== -1){
                        while(bracketCount != 0) {
                            if((data.equation[equationIndex - stopIndex]) !== undefined) {
                                stopIndex++;
                                if (data.equation[equationIndex - stopIndex] === '(') {
                                    bracketCount--;
                                } else if (data.equation[equationIndex - stopIndex] === ')'){
                                    bracketCount++;
                                }
                            } else {
                                break;
                            }
                        }
                        beginningIndex = equationIndex - stopIndex;
                        if(dictionary.functions.indexOf(data.equation[equationIndex - stopIndex - 1]) !== -1) beginningIndex = equationIndex - stopIndex - 1;
                        insertFunction.indexes.push(beginningIndex);
                    }
                }

                bracketCount = 1;
                stopIndex = 1;
                if(dictionary.brackets.indexOf(data.equation[equationIndex + stopIndex]) !== -1){
                    while(bracketCount !== 0) {
                        if((data.equation[equationIndex + stopIndex]) !== undefined) {
                            stopIndex++;
                            if (data.equation[equationIndex + stopIndex] === ')') {
                                bracketCount--;
                            } else if (data.equation[equationIndex + stopIndex] === '('){
                                bracketCount++;
                            }
                        } else {
                            break;
                        }
                    }
                    beginningIndex = equationIndex + stopIndex;
                    const offSet = (insert.length + 1) * 3;
                    insertFunction.indexes.push(beginningIndex + offSet);
                }

                insert.unshift(insertFunction);
            }

            finalEquation.push(equationElement);
        });

        if(insert.length > 0) {
            insert.forEach((insertFunc) => {
                if(insertFunctionMethod[insertFunc.type] !== null) {
                   finalEquation = insertFunctionMethod[insertFunc.type](finalEquation,insertFunc.indexes);
                }
           });
        }

        const multiplyIndexes = [];
        finalEquation.forEach((finalElement, finalIndex) => {
            //handle implicit multiplication
            if(finalElement == ')') {
                if([...dictionary.functions, '(',...dictionary.constants,...dictionary.number].indexOf(finalEquation[finalIndex+1]) !== -1){
                    multiplyIndexes.unshift(finalIndex+1);
                }
            }

            if([...dictionary.constants, ...dictionary.number].indexOf(finalElement) !== -1) {
                if([...dictionary.functions, '(', ...dictionary.constants].indexOf(finalEquation[finalIndex+1]) !== -1) {
                    multiplyIndexes.unshift(finalIndex+1);
                }
            }

            if(translation[finalElement]) {
                finalEquation[finalIndex] = translation[finalElement];
            }

            if(finalElement === 'Ans') finalEquation[finalIndex] = data.answer;
        });

        if(multiplyIndexes.length > 0) {
            multiplyIndexes.forEach(multiplyIndex => {
                finalEquation.splice(multiplyIndex,0,'*');
            });
        }

        let result = finalEquation.join('');
        // console.log(result);

        try {
            result = eval(result);
            // console.log(result);
            data.equation = [result];
            data.answer = result;
        } catch(e) {
            data.equation = ['error'];
        }
        return;
    }

    const clearData = function() {
        data.equation = [];
        data.currentType = null;
        data.currentRules.acceptedInputs = null;
    }

    const clearAns = function() {
        data.answer = 1;
    }

    return {
        getEquation,
        addInput,
        evalEquation,
        clearData,
        clearAns
    }

})();

const UICtrl = (function(){
    const UISelectors = {
        'calculatorButtons' : '.calculator-buttons',
        'displayResult' : '#calculator-display .results',
        'deleteButton' : '.delete-button',
        'moreButton' : '.more-button',
        'buttonLists' : '.buttons-container li',
        'buttonsContainer' : '.buttons-container',
        'calculatorDisplay' : '#calculator-display'
    }

    displayTranslation = {
        '/' : {
           html : '<i class="fas fa-divide"></i>',
           class : 'dark-button-color'
        },
        '*' : {
           html : '<i class="fas fa-times"></i>',
           class : 'dark-button-color'
        },
        '-' : {
           html : '<i class="fas fa-minus"></i>',
           class : 'dark-button-color'
        },
        '+' : {
           html : '<i class="fas fa-plus"></i>',
           class : 'dark-button-color'
        },
        '=' : {
           html : '<i class="fas fa-equals"></i>',
           class : 'dark-button-color'
        },
    }

    const currentState = {
        state : 'basic'
    }

    const functionLayoutSequence = ['Ans', 'sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'PI', 'E', '^', '(', ')'];
    const basicLayoutSequence = ['7', '8', '9', '/', '4', '5','6','*','1','2','3','-','.','0','=','+'];

    const functionLayout = function() {
        const buttonsContainer = document.querySelector(UISelectors.calculatorButtons);
        const ul = document.createElement('ul');
        ul.className = 'buttons-container';
        functionLayoutSequence.forEach(functionButton => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.setAttribute('value', functionButton);
            button.textContent = functionButton;
            li.appendChild(button);
            li.style.width = '32%';
            ul.appendChild(li);
        });
        buttonsContainer.appendChild(ul);
        currentState.state = 'function';
    }

    const basicLayout = function() {
        const buttonsContainer = document.querySelector(UISelectors.calculatorButtons);
        const ul = document.createElement('ul');
        ul.className = 'buttons-container';
        basicLayoutSequence.forEach(functionButton => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.setAttribute('value', functionButton);
            if(displayTranslation[functionButton] !== undefined) {
                button.innerHTML = displayTranslation[functionButton].html;
                button.className = displayTranslation[functionButton].class;
            } else {
                button.innerHTML = functionButton;
            }
            li.appendChild(button);
            li.style.width = '24%';
            ul.appendChild(li);
        });
        buttonsContainer.appendChild(ul);
        currentState.state = 'basic';
    }

    const removeButtons = function(){
        const buttonsContainer = document.querySelector(UISelectors.calculatorButtons);
        while(buttonsContainer.firstElementChild) {
            buttonsContainer.firstElementChild.remove();
        }
    }

    const displayEquation = function(equation) {
        document.querySelector(UISelectors.displayResult).textContent = equation.join('');
    }

    const getCurrentState = function() {
        return currentState;
    }

    return {
        UISelectors,
        displayEquation,
        functionLayout,
        basicLayout,
        getCurrentState,
        removeButtons
    }
})();

const appCtrl = (function(dataCtrl, UICtrl){
    const htmlSelectors = UICtrl.UISelectors;

    const loadedEventListeners = function() {
        let buttons = document.querySelectorAll(htmlSelectors.calculatorButtons);
        const deleteButton = document.querySelector(htmlSelectors.deleteButton);
        const moreButton = document.querySelector(htmlSelectors.moreButton);
        buttons = Array.from(buttons);
        buttons.forEach(button => {
            button.addEventListener('click', updateEquation); 
        });
        deleteButton.addEventListener('click', clearData);
        moreButton.addEventListener('click', changeState);
    }

    const clearData = function(){
        dataCtrl.clearData();
        dataCtrl.clearAns();
        UICtrl.displayEquation(dataCtrl.getEquation());
    }

    const changeState = function(){
        const currentState = UICtrl.getCurrentState().state;
        UICtrl.removeButtons();
        if(currentState === 'basic'){
            UICtrl.functionLayout();
        } else {
            UICtrl.basicLayout();
        }
    }

    const updateEquation = function(e) {
        let input = null;
        if(e.target.tagName === 'I') {
            input = e.target.parentElement.value;
        } else if(e.target.tagName === 'BUTTON') {
            input = e.target.value;
        }

        if(input !== null) {
            if(dataCtrl.addInput(input)) {
                if(input === '=') dataCtrl.evalEquation();
                UICtrl.displayEquation(dataCtrl.getEquation());
                if(input === '=') dataCtrl.clearData();
            }
        }
    }

    const init = function() {
        console.log('App is initialized....');
        loadedEventListeners();
    }

    return {
        init
    }

})(dataCtrl, UICtrl);


appCtrl.init();