const dataCtrl = (function(){
    const dictionary = {
        'operator' : ['*', '-', '+', '/'],
        'number' : ['1','2','3','4','5','6','7','8','9','0', '.'],
        'functions' : ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt'],
        'functionsTwoParams' : ['^'],
        'constants' : ['PI', 'E', 'Ans'],
        'brackets' : ['(', ')']
    }

    const insertFunctionMethod = {
        '^' : function(equation, indexes) {
            console.log(indexes);
            if(indexes.length > 0) {
                equation.splice(indexes[0], 1, ',');
                equation.splice(indexes[1], 0, 'pow', '(');
                equation.push(')');
            }
            return equation;
        }
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
        'pow' : 'Math.pow'
    }

    const dictionaryRules = {
        'operator' : {
            'correctInputs' : ['number', 'functions', 'brackets', 'functionsTwoParams', 'operator']
        },
        'number' :{
            'correctInputs' : ['number', 'functions', 'decimals', 'operator', 'brackets', 'functionsTwoParams']
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

    const logData = function() {
        return data;
    }

    const addInput = function(input) {
        if(input === '=') return true;

        for(let type in dictionary) {
            if(dictionary[type].indexOf(input) !== -1) {
                if(data.currentRules.acceptedInputs !== null) {
                    if(data.currentRules.acceptedInputs.indexOf(type) === -1) return false;
                }

                if(dictionaryRules[type]) {
                    switch(type) {
                        case 'operator' :
                            if(data.currentInputType === 'operator') {
                                data.equation[data.equation.length - 1] = input;
                            } else {
                                data.equation.push(input);
                            }
                            break;
                        case 'functions' :
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
        console.log(data.equation);
        return true;
    }

    const evalEquation = function() {
        let insert = [];
        let finalEquation = [];

        data.equation.forEach((equationElement, equationIndex) => {
            if(dictionary.functionsTwoParams.indexOf(equationElement) !== -1) {
                let bracketCount = 0;
                let stopIndex = 0;
                let numberCount = 0;
                let beginningIndex = 0;
                const insertFunction = {
                    type : equationElement,
                    indexes : [equationIndex]
                };

                if(dictionary.number.indexOf(data.equation[equationIndex - 1]) !== -1) {
                    stopIndex = 1;
                    while(dictionary.number.indexOf(data.equation[equationIndex - stopIndex]) !== -1) {
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
                insert.unshift(insertFunction);
            }

            finalEquation.push(equationElement);
        });

        if(insert.length > 0) {
            insert.forEach(insertFunc => {
                if(insertFunctionMethod[insertFunc.type] !== null) {
                   finalEquation = insertFunctionMethod[insertFunc.type](finalEquation,insertFunc.indexes);
                }
           });
        }

        console.log(finalEquation);

        const multiplyIndexes = [];
        finalEquation.forEach((finalElement, finalIndex) => {
            //handle implicit multiplication
            if(finalElement == ')') {
                if([...dictionary.functions, ...dictionary.brackets,...dictionary.constants,...dictionary.number].indexOf(finalEquation[finalIndex+1]) !== -1){
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
        });

        if(multiplyIndexes.length > 0) {
            multiplyIndexes.forEach(multiplyIndex => {
                finalEquation.splice(multiplyIndex,0,'*');
            });
        }

        console.log(finalEquation);

        return;
        data.equation = [{element : result, type : 'number'}];
    }

    const clearData = function() {
        data.equation = [];
        data.currentInput = null;
        data.currentRules.acceptedInputs = null;
        data.currentRules.replaceInputs = null;
    }

    return {
        getEquation,
        logData,
        addInput,
        evalEquation,
        clearData
    }

})();

const UICtrl = (function(){
    const UISelectors = {
        'calculatorButtons' : '#calculator-buttons',
        'displayResult' : '#calculator-display .results',
        'deleteButton' : '.delete-button',
        'moreButton' : '.more-button',
        'buttonLists' : '.buttons-container li',
        'buttonsContainer' : '.buttons-container'
    }

    const functionLayoutSequence = ['Ans', 'sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'PI', 'E', '^', '(', ')'];

    const functionLayout = function() {
        //removeButtons();
        const buttonsContainer = document.querySelector(UISelectors.buttonsContainer);
        functionLayoutSequence.forEach(functionButton => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.setAttribute('value', functionButton);
            button.textContent = functionButton;
            li.appendChild(button);
            li.style.width = '32%';
            buttonsContainer.appendChild(li);
        });
    }

    const removeButtons = function(){
        const buttonsContainer = document.querySelector(UISelectors.buttonsContainer);
        while(buttonsContainer.firstElementChild) {
            buttonsContainer.firstElementChild.remove();
        }
    }

    const displayEquation = function(equation) {
        const equationElements = equation.map(equationElement => {return equationElement.element});
        document.querySelector(UISelectors.displayResult).textContent = equationElements.join('');
    }

    return {
        UISelectors,
        displayEquation,
        functionLayout
    }
})();

const appCtrl = (function(dataCtrl, UICtrl){
    const htmlSelectors = UICtrl.UISelectors;

    const loadedEventListeners = function() {
        UICtrl.functionLayout();
        let buttons = document.querySelectorAll(htmlSelectors.calculatorButtons);
        const deleteButton = document.querySelector(htmlSelectors.deleteButton);
        const moreButton = document.querySelector(htmlSelectors.moreButton);
        buttons = Array.from(buttons);
        buttons.forEach(button => {
            button.addEventListener('click', updateEquation); 
        });
        deleteButton.addEventListener('click', clearData);
        moreButton.addEventListener('click', changeFunState);
    }

    const clearData = function(){
        dataCtrl.clearData();
        UICtrl.displayEquation(dataCtrl.getEquation());
    }

    const changeFunState = function(){
        UICtrl.functionLayout();
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
                if(input === '=') {
                    dataCtrl.evalEquation();
                }

                UICtrl.displayEquation(dataCtrl.getEquation());
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