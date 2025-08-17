// Crea un nuevo archivo: fsm.js
export class FSM {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = {};
    this.transitions = {};
  }

  addState(name, behavior) {
    this.states[name] = behavior;
  }

  addTransition(fromState, toState, condition) {
    if (!this.transitions[fromState]) {
      this.transitions[fromState] = [];
    }
    this.transitions[fromState].push({ to: toState, when: condition });
  }

  update() {
    // Ejecutar comportamiento del estado actual
    if (this.states[this.currentState]) {
      this.states[this.currentState]();
    }

    // Verificar transiciones
    const possibleTransitions = this.transitions[this.currentState] || [];
    for (const transition of possibleTransitions) {
      if (transition.when()) {
        this.currentState = transition.to;
        break;
      }
    }
  }
}
