import React, { Component } from 'react';
import Tabs from './WizardTabs';
import Content from './WizardContent';
import Nav from './WizardNavigation';
import * as defaultRenderer from './defaultRenderer';
import _ from 'lodash';

const stepKeyPattern = /(step_)(\d)+/;

function steps2array(state) {
    
    let steps = _.map(state, (val, key) => stepKeyPattern.test(key) ? {key, val} : null)
        .filter(i => i != null);
    steps.sort((a, b) => a.key - b.key);

    steps = steps.map(i => i.val);

    return steps;
}

function getStepState(stepsArray) {
    return stepsArray.reduce((curr, { label, state }, i) => {
        let result = {
            ...curr,
            [i]: state,
        };

        if (label) {
            result = {...result, [label]: state };
        }

        return result;
    }, {});
}

function exportState(state) {
    return getStepState(steps2array(state));
}

class Wizard extends Component {

    constructor(props) {
        super(props);

        let { 
            start = 0, 
            steps = [], 
            renderer = defaultRenderer 
        } = props;

        this.renderer = renderer;

        this.labelsMap = steps.reduce((curr, step, i) => {
            const { label = ("" + i)} = step;
            return {
                ...curr,
                [label]: i,
            };
        }, {});

        let stateSteps = steps.reduce((state, step, idx) => ({
            ...state,
            [`step_${idx}`]: {
                ...step, 
                active: step.active ? step.active : true,
                valid: (step.valid !== undefined && step.valid !== null) ? 
                    (typeof(step.valid === 'function') ? step.valid(state) : step.valid) : true,
                state: {},
                touched: idx == start,
            }
        }), {});

        //setup navigation
        // stateSteps = this._makeNavigable(stateSteps);
        
        let initialState = {
            current: parseInt(start),
            ...stateSteps,
        };

        this.state = initialState;

        // bindings
        this.handleStepStateChange = _.debounce(this.handleStepStateChange.bind(this), 300, {leading: true});
        // this.handleStepStateChange = this.handleStepStateChange.bind(this);
        this.handleStepValidationChange = _.debounce(this.handleStepValidationChange.bind(this), 300, {leading: true});
        // this.handleStepValidationChange = this.handleStepValidationChange.bind(this);
    }

    getStepIndex = label => {
        if (typeof(label) === "string")
            return this.labelsMap[label];

        return label;
    }

    _makeNavigable(steps) {

        // for (let name in steps) {
        //     let res = stepKeyPattern.exec(name);
        //     if (res) {
        //         let i = parseInt(res[2]);
        //         let step = steps[name];
        //         step.navigable = i == 0 || steps[res[1] + (i - 1)].valid && steps[res[1] + (i - 1)].navigable; 
        //     }
        // }

        return steps;
    }

    handleStepChange = stepIndex => {
        let stepKey = `step_${stepIndex}`;
        this.setState( prevState => ({ 
            current: stepIndex,
            [stepKey]: { ...prevState[stepKey], touched: true },
        }));
    }

    handleStepStateChange(stepIndex, state, validator) {

        this.setState( prevState => {
            
            let stepKey = `step_${stepIndex}`;
            let step = prevState[stepKey];
            let valid = step.valid;

            let newState = {
                ...step.state, 
                ...state, 
            };

            if (validator) {
                valid = validator(newState);
            }

            return {
                [stepKey]: {...step, state: newState, valid},
            };

        });

    }

    getStepState = step => this.state[`step_${this.getStepIndex(step)}`].state;

    isStepActive = step => this.state[`step_${this.getStepIndex(step)}`].active;

    handleStepValidationChange = (stepIndex, valid) => {
        this.setState( prevState => {

            let stepKey = `step_${stepIndex}`;
            let step = prevState[stepKey];

            return { 
                [stepKey]: {...step, valid},
            }
        });
    }

    setStepActiveStatus = (stepId, active) => {
        this.setState( prevState => {
            let stepKey = `step_${this.getStepIndex(stepId)}`;
            let step = prevState[stepKey];

            return { 
                [stepKey]: {...step, active},
            };
        });
    }

    handleFinish = () => {
        this.props.onFinish(exportState(this.state));
    }

    render() {

        const { current } = this.state;

        let stepsState = steps2array(this.state);
        const { steps: stepProps } = this.props;
        const state = getStepState(stepsState);
        let prevActiveStep = { valid: true, navigable: true };

        stepsState = stepsState.map( (step, i) => {
            let { active, title } = step;
            let { valid = true } = stepProps[i];
            
            if (typeof(active) === 'function') {
                active = active(state) || false;
            }
            if (typeof(title) === 'function') {
                title = title(state);
            }
            if (typeof(valid) === 'function') {
                valid = valid(state) || false;
            }

            const navigable = prevActiveStep.valid && prevActiveStep.navigable;

            const result = {
                ...step,
                active,
                title,
                valid,
                navigable,
            };

            if (active) {
                prevActiveStep = result;
            }

            return result;
        });

        let { customNumbers = false, hideNumbers = false } = this.props;

        return this.renderer.wiz(
            <Tabs steps={stepsState} current={current} 
                customNumbers={customNumbers}
                hideNumbers={hideNumbers}
                renderContainer={this.renderer.tabsContainer}
                renderTab={this.renderer.tab}
                onStepChange={this.handleStepChange} />,
            <Content steps={stepsState} current={current} 
                renderContainer={this.renderer.stepsContainer}
                renderStep={this.renderer.step}
                setStepActiveStatus={this.setStepActiveStatus}
                onValidateStep={this.handleStepValidationChange}
                onStepStateChange={this.handleStepStateChange}
                getStepState={this.getStepState}
                isStepActive={this.isStepActive} />,
            <Nav steps={stepsState} current={current} render={this.renderer.nav}
                onFinish={this.handleFinish}
                onStepChange={this.handleStepChange} />
        );
    }

}

export default Wizard;

export { default as StepContainer } from './StepContainer';