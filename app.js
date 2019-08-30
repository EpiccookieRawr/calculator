const dataCtrl = (function(){
    const dictionary = {
        'operator' : ['*', '-', '+', '/'],
        'number' : ['1','2','3','4','5','6','7','8','9','0'],
        'decimals' : ['.'],
        'functions' : ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt'],
        'functionsTwoParams' : ['^'],
        'constants' : ['PI', 'E', 'Ans'],
        'brackets' : ['(', ')']
    }

    const translation = {
        'sin' : ['Math.sin'],
        'cos' : ['Math.cos'],
        'tan' : ['Math.tan'],
        'ln' : ['Math.log'],
        'sqrt' : ['Math.sqrt'],
        'log' : ['1' , '/' , 'Math.LN10', '*', 'Math.log'],
        'PI' : ['Math.PI'],
        'E' : ['Math.E']
    }

    const translationFunction = {
        '^' : function(equation, index) {
            return {
            }
        },
        '!' : function(equation) {
            return equation;
        }
    }

    const dictionaryRules = {
        'operator' : {
            'correctInputs' : ['number', 'functions', 'brackets', 'functionsTwoParams'],
            'replace' : ['operator'],
        },
        'number' :{
            'correctInputs' : ['number', 'functions', 'decimals', 'operator', 'brackets', 'functionsTwoParams'],
            'replace' : []
        },
        'decimals' : {
            'correctInputs' : ['number'],
            'replace' : ['decimals']
        },
        'functions' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets', 'functionsTwoParams'],
            'replace' : [],
        },
        'functionsTwoParams' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets', 'functionsTwoParams'],
            'replace' : [],
        },
        'constants' : {
            'correctInputs' : ['number', 'functions', 'operator', 'brackets', 'functionsTwoParams'],
            'replace' : []
        },
        'brackets' : {
            'correctInputs' : ['number', 'functions', 'constants', 'brackets', 'functionsTwoParams'],
            'replace' : [],
        }
    }

    const data = {
        'equation' : [],
        'currentInput' : null,
        'currentRules' : {
            'acceptedInputs' : null,
            'replaceInputs' : null,
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
        let currentInputType = '';

        for(let type in dictionary) {
            if(dictionary[type].indexOf(input) !== -1) {
                currentInputType = type;
                // if(data.currentRules.replaceInputs !== null) {
                //     if(data.currentRules.replaceInputs.indexOf(currentInputType) !== -1) {
                //         if(dictionaryRules[currentInputType] !== null) {
                //             data.currentInput = input;
                //             data.currentRules.acceptedInputs = dictionaryRules[currentInputType].correctInputs;
                //             data.currentRules.replaceInputs = dictionaryRules[currentInputType].replace;
                //             switch(currentInputType) {
                //                 case 'functions' :
                //                     data.equation.splice(data.equation.length -2, 2,{'element' : input, 'type' : currentInputType}, {element : '(', type : 'brackets'});
                //                     break;
                //                 default:
                //                     data.equation[data.equation.length -1] = {'element' : input, 'type' : currentInputType};
                //             }
                //             return true;
                //         }
                //     }
                // }

                // if(data.currentRules.acceptedInputs !== null) {
                //     if(data.currentRules.acceptedInputs.indexOf(currentInputType) === -1) return false;
                // }

                if(dictionaryRules[currentInputType]) {
                    data.currentInput = input;
                    data.currentRules.acceptedInputs = dictionaryRules[currentInputType].correctInputs;
                    data.currentRules.replaceInputs = dictionaryRules[currentInputType].replace;
                    switch(currentInputType) {
                        case 'functions' :
                            data.equation.push(input, '(');
                            break;
                        default:
                            data.equation.push(input);
                    }
                }
            }
        }

        //let equationElements = data.equation.map(equationElement => {return equationElement.element});
        console.log(data.equation);
        return true;
    }

    const evalEquation = function() {
        let finalEquation = [];
        data.equation.forEach((equationElement, equationIndex) => {
            finalEquation.push(equationElement);

            // const translatedElement = translation[equationElement.element];
            // if(translatedElement !== undefined) {
            //     if(translatedElement.length > 0) {
            //         translatedElement.forEach(element => {
            //             finalEquation.push(element);
            //         });
            //     }
            // } else {
            //     finalEquation.push(equationElement.element);
            // }

            // const nextValue = data.equation[equationIndex + 1];
            // if(nextValue !== undefined){
            //     if(['number', 'constants'].indexOf(equationElement.type) !== -1) {
            //         if(['brackets', 'functions', 'functionsTwoParams'].indexOf(nextValue.type) !== -1 && nextValue.element !== ')') finalEquation.push('*');
            //     }
            //     if(['brackets'].indexOf(equationElement.type) !== -1) {
            //         if(['number', 'functions', 'functionsTwoParams', 'constants'].indexOf(nextValue.type) !== -1 && equationElement.element !== '(') {
            //             finalEquation.splice(finalEquation.length, 0, '*');
            //         }
            //         if(['brackets'].indexOf(nextValue.type) !== -1 && equationElement.element !== ')'){
            //             finalEquation.splice(finalEquation.length, 0, '*');
            //         }
            //     }
            // }
        });
        console.log(finalEquation);
        const translateFunctionIndex = []
        finalEquation.forEach((finalEquationElement, finalEquationIndex) => {
            if(translationFunction[finalEquationElement]) {
                
                translateFunctionIndex.push({
                    index : finalEquationIndex,
                    type : finalEquationElement
                });
            }
        });
        console.log(translateFunctionIndex);

        if(translateFunctionIndex.length > 0) {
            translateFunctionIndex.forEach((translateElement, translateIndex) => {
                finalEquation = translationFunction[translateElement.type](translateElement.index, finalEquation);
            });
        }
        //const result = eval(finalEquation.join(''));
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