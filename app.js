const dataCtrl = (function(){
    const dictionary = {
        'operator' : ['*', '-', '+', '/'],
        'number' : ['1','2','3','4','5','6','7','8','9','0'],
        'decimals' : ['.'],
        'functions' : ['sin', 'cos', 'tan', 'ln', 'log', '!', 'sqrt'],
        'functionsValueRequired' : ['^'],
        'constants' : ['pi', 'e'],
        'brackets' : ['(', ')']
    }

    const translation = {
        evalTranslation : {
            'sin' : 'Math.sin',
            'cos' : 'Math.cos',
            'tan' : 'Math.tan',
            'ln' : 'Math.log',
            'sqrt' : 'Math.sqrt',
            '^' : 'pow'
        },
        displayTranslation : {

        }
    }

    const dictionaryRules = {
        'operator' : {
            'correctInputs' : ['number', 'functions', 'brackets', 'functionsValueRequired'],
            'replace' : ['operator'],
        },
        'number' :{
            'correctInputs' : ['number', 'functions', 'decimals', 'operator', 'brackets', 'functionsValueRequired'],
            'replace' : []
        },
        'decimals' : {
            'correctInputs' : ['number'],
            'replace' : ['decimals']
        }, 
        'functions' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets', 'functionsValueRequired'],
            'replace' : ['functions', 'functionsValueRequired'],
        },
        'functionsValueRequired' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets', 'functionsValueRequired'],
            'replace' : ['functions', 'functionsValueRequired'],
        },
        'brackets' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets', 'functionsValueRequired'],
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
        'inputQueue' : false,
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

        for(let index in dictionary) {
            if(dictionary[index].indexOf(input) !== -1) {
                currentInputType = index;
                if(data.currentRules.replaceInputs !== null) {
                    if(data.currentRules.replaceInputs.indexOf(currentInputType) !== -1) {
                        if(dictionaryRules[currentInputType]) {
                            data.currentInput = input;
                            data.currentRules.acceptedInputs = dictionaryRules[currentInputType].correctInputs;
                            data.currentRules.replaceInputs = dictionaryRules[currentInputType].replace;
                            switch(currentInputType) {
                                default:
                                    data.equation[data.equation.length - 1] = {'element' : input, 'type' : currentInputType};
                            }
                            return true;
                        }
                    }
                    
                }

                if(data.currentRules.acceptedInputs !== null) {
                    if(data.currentRules.acceptedInputs.indexOf(currentInputType) === -1) return false;
                }

                if(dictionaryRules[currentInputType]) {
                    let index = data.equation.length - 1;
                    data.currentInput = input;
                    data.currentRules.acceptedInputs = dictionaryRules[currentInputType].correctInputs;
                    data.currentRules.replaceInputs = dictionaryRules[currentInputType].replace;
                    switch(currentInputType) {
                        case 'functions' :
                            if(data.equation[index].type === 'number') data.equation.push({ element : '*', type : 'operator'});
                            data.equation.push({'element' : input, 'type' : currentInputType});
                            data.equation.push({element : '(', type : 'brackets'});
                            break;
                        case 'functionsValueRequired' :
                            data.equation.splice(index, 0, {'element' : input, 'type' : currentInputType},  {element : '(', type : 'brackets'});
                            data.equation.push({element : ',', type : 'operator'}, {element : ')', type : 'brackets'});
                            data.inputQueue = true;
                            break;
                        case 'brackets':
                            if(data.inputQueue === true) data.equation.splice(index - 1, 0, {element : '(', type : 'brackets'});
                            break;
                        default:
                            if(data.inputQueue) {
                                data.equation.splice(index, 0, {'element' : input, 'type' : currentInputType});
                            } else {
                                data.equation.push({'element' : input, 'type' : currentInputType});
                            }
                    }

                    if(data.inputQueue) {
                        if(input === ')') {
                            data.inputQueue == false;
                        }
                    }
                }
            }
        }

        const equationElements = data.equation.map(equationElement => {return equationElement.element});
        console.log(equationElements);

        return true;
    }

    const evalEquation = function() {
        let finalEquation = [];

        data.equation.forEach((equationElement, index) => {
            if(translation.evalTranslation[equationElement.element]) {
                data.equation[index].element = translation.evalTranslation[equationElement.element];
            }
        });

        const finalEquationElements = finalEquation.map(equationElement => {return equationElement.element});
        console.log(finalEquationElements);
        return;
        const result = eval(finalEquationElements.join(''));
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

    const functionLayoutSequence = ['sin', 'cos', 'tan', 'ln', 'log', '!', 'pi', 'e', '^', '(', ')', 'sqrt'];

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