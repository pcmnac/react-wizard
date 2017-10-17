import React from 'react';
import { Grid, Row, Col, Nav, NavItem, Button, ButtonGroup, Badge, Glyphicon }  from 'react-bootstrap';
import StepContainer from 'components/Wizard/StepContainer';

export function wiz(tabs, content, nav) {
    return (
        <Grid>
            {tabs}
            {content}
            {nav}
        </Grid>
    );
}

export function tabsContainer(tabs) {
    return (
        <Nav bsStyle="pills" className="nav-wizard" justified={false}>{tabs}</Nav>
    );
}

export function tab(step, index, current, hideNumbers, changeStep) {

    let numberBadge = hideNumbers ? null : <Badge>{step.number}</Badge>;
    let icon = <Glyphicon glyph="ok" style={{visibility: 'hidden'}} />;

    if (step.touched) {
        if (step.valid) {
            icon = <Glyphicon glyph="ok" />;
        } else {
            icon = <Glyphicon glyph="remove" className="text-danger" />;
        }
    }

    return (
        <NavItem key={index} active={current}
            className={step.valid ? 'valid ' : ' '}
            disabled={!step.navigable || current}
            style={{
                display: step.active !== false ? 'table-cell' : 'none',
                cursor: step.navigable ? 'pointer' : 'not-allowed',
            }}
            onClick={changeStep}>
            {numberBadge}
            <span style={{margin: "0 5px"}}>{step.title}</span>
            {icon}
        </NavItem>
    );
}

export function stepsContainer(steps) {
    return (
        <Row>
            <Col xs={12}>{steps}</Col>
        </Row>
    );
}

export function step(step, index, current, setStepActiveStatus, isStepActive, stateManager) {

    return (
        <div key={index} style={{display: index === current ? 'block' : 'none'}}>
            <StepContainer Component={step.component} 
                key={index} index={index} 
                valid={step.valid}
                stepState={step.state}
                isStepActive={isStepActive}
                setStepActiveStatus={setStepActiveStatus}
                stateManager={stateManager}
                />
        </div>
    );
}

export function nav(first, last, valid, prev, next, finish) {

    return (
        <fieldset>
            <legend></legend>
            <Row className="text-center">
                <Button 
                    style={{display: first ? 'none' : 'inline-block',}}
                    onClick={prev}><Glyphicon glyph="chevron-left" /> Anterior</Button>
                {' '}
                <Button disabled={!valid} bsStyle="primary"
                    style={{display: last ? 'none' : 'inline-block',}}
                    onClick={next}>Próximo <Glyphicon glyph="chevron-right" /></Button> 
                {' '}
                <Button disabled={!valid} bsStyle="primary"
                    style={{ display: last ? 'inline-block' : 'none', }}
                    onClick={finish}>Concluir <Glyphicon glyph="ok" /></Button> 
            </Row>
            <br/>
        </fieldset>
    );
}
