let _lab = null;
let _currentStep = 0;
let _hintsUsed = 0;
let _stepsCompleted = 0;

export function startLab(labData) {
  _lab = labData;
  _currentStep = 0;
  _hintsUsed = 0;
  _stepsCompleted = 0;
}

export function getLab() {
  return _lab;
}

export function getCurrentStep() {
  return _lab ? _lab.steps[_currentStep] : null;
}

export function getCurrentStepIndex() {
  return _currentStep;
}

export function validateStep(input) {
  if (!_lab) return false;
  const step = _lab.steps[_currentStep];
  if (!step) return false;
  const trimmed = input.trim().toLowerCase();
  return step.acceptedAnswers.some(a => a.toLowerCase() === trimmed);
}

export function completeStep() {
  if (!_lab) return;
  _stepsCompleted++;
  if (_currentStep < _lab.steps.length - 1) {
    _currentStep++;
    return true;
  }
  return false;
}

export function getHint(stepIndex) {
  if (!_lab) return null;
  _hintsUsed++;
  return _lab.steps[stepIndex]?.hint || null;
}

export function getLabScore() {
  if (!_lab || _lab.steps.length === 0) return 0;
  const hintPenalty = Math.min(_hintsUsed * 5, 30);
  const base = Math.round((_stepsCompleted / _lab.steps.length) * 100);
  return Math.max(0, base - hintPenalty);
}

export function isComplete() {
  return _lab ? _stepsCompleted >= _lab.steps.length : false;
}

export function getTotalSteps() {
  return _lab ? _lab.steps.length : 0;
}

export function clearLab() {
  _lab = null;
  _currentStep = 0;
  _hintsUsed = 0;
  _stepsCompleted = 0;
}
