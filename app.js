const dataCtrl = (function(){
    const dictionary = {
        'operator' : ['*', '-', '+', '/'],
        'number' : ['1','2','3','4','5','6','7','8','9','0'],
        'decimals' : ['.'],
        'functions' : ['sin(', 'cos(', 'tan(', 'In(', 'log(', '!', '^', 'sqrt('],
        'constants' : ['pi', 'e'],
        'brackets' : ['(', ')']
    }

    const translation = {
        evalTranslation : {
            'sin(' : 'Math.sin(',
            'cos(' : 'Math.cos(',
            'tan(' : 'Math.tan(',
        },
        displayTranslation : {

        }
    }

    const dictionaryRules = {
        'operator' : {
            'correctInputs' : ['number', 'functions', 'brackets'],
            'replace' : ['operator'],
        },
        'number' :{
            'correctInputs' : ['number', 'functions', 'decimals', 'operator', 'brackets'],
            'replace' : []
        },
        'decimals' : {
            'correctInputs' : ['number'],
            'replace' : ['decimals']
        }, 
        'functions' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets'],
            'replace' : ['functions'],
        },
        'brackets' : {
            'correctInputs' : ['number', 'decimals', 'functions', 'constants', 'brackets'],
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
                                    data.equation[data.equation.length - 1] = input;
                            }
                            return true;
                        }
                    }
                    
                }

                if(data.currentRules.acceptedInputs !== null) {
                    if(data.currentRules.acceptedInputs.indexOf(currentInputType) === -1) return false;
                }



                if(dictionaryRules[currentInputType]) {
                    data.currentInput = input;
                    data.currentRules.acceptedInputs = dictionaryRules[currentInputType].correctInputs;
                    data.currentRules.replaceInputs = dictionaryRules[currentInputType].replace;
                    switch(currentInputType) {
                        default:
                            data.equation.push(input);
                    }
                }
            }
        }
        console.log(data.equation);

        return true;
    }

    const evalEquation = function() {
        data.equation.forEach((element, index) => {
            if(translation.evalTranslation[element]) {
                data.equation[index] = translation.evalTranslation[element];
            }
            for(let dictionaryIndex in dictionary) {
                if(dictionary[dictionaryIndex].indexOf(element) !== -1) {
                    data.equation[index] = {
                        element : element,
                        type : dictionaryIndex
                    }
                }
            }
        });
        console.log(data.equation);
        return false;
        const result = eval(data.equation.join(''));
        data.equation = [result];
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

    const functionButtons = ['sin(', 'cos(', 'tan(', 'In(', 'log(', '!', 'pi', 'e', '^', '(', ')', 'sqrt('];

    const functionLayout = function() {
        //removeButtons();
        const buttonsContainer = document.querySelector(UISelectors.buttonsContainer);
        functionButtons.forEach(functionButton => {
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
        document.querySelector(UISelectors.displayResult).textContent = equation.join('');
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