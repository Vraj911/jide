/**
 * J++ Type Checker - Enforces strict type safety
 * 
 * RULES:
 * - + operator: ONLY numbers allowed
 * - . operator: ONLY strings allowed
 * - Variables remember their type from first assignment
 * - Reassigning incompatible types → ERROR
 * - Zero implicit coercion
 */
class TypeChecker {
  constructor() {
    // Symbol table: variable name -> type ('number' | 'string')
    this.symbols = new Map();
  }
  /**
   * Infer type from AST node
   */
  inferType(node) {
    if (!node) return null;
    switch (node.type) {
      case 'Number':
        return 'number';
      case 'String':
        return 'string';
      case 'Identifier':
        const symInfo = this.symbols.get(node.value);
        if (!symInfo) {
          const err = new Error(`Variable "${node.value}" used before declaration`);
          err.line = node.line || 0; err.col = node.col || 0; throw err;
        }
        return symInfo.type;
      case 'BinaryOp':
        if (node.operator === '+' || node.operator === '-' || node.operator === '*' || node.operator === '/') {
          const leftType = this.inferType(node.left);
          const rightType = this.inferType(node.right);
          
          if (leftType !== 'number' || rightType !== 'number') {
            throw new Error(
              `Operator "${node.operator}" requires numeric operands. ` +
              `Got: ${leftType || 'unknown'} ${node.operator} ${rightType || 'unknown'}`
            );
          }
          return 'number';
        }
        throw new Error(`Unknown binary operator: ${node.operator}`);
      case 'ConcatOp':
        const leftStrType = this.inferType(node.left);
        const rightStrType = this.inferType(node.right);
        
        if (leftStrType !== 'string' || rightStrType !== 'string') {
          throw new Error(
            `Operator "." requires string operands. ` +
            `Got: ${leftStrType || 'unknown'} . ${rightStrType || 'unknown'}`
          );
        }
        return 'string';
      
      default:
        throw new Error(`Cannot infer type for node: ${node.type}`);
    }
  }
  checkDeclaration(name, valueNode, declLine, declCol) {
    if (this.symbols.has(name)) {
      const err = new Error(`Variable "${name}" already declared`);
      err.line = declLine || 0; err.col = declCol || 0; throw err;
    }
    let type = 'number';
    if (valueNode) { type = this.inferType(valueNode); }
    this.symbols.set(name, { type, line: declLine || 0, col: declCol || 0 });
  }
  checkAssignment(name, valueNode, assignLine, assignCol) {
    const symInfo = this.symbols.get(name);
    if (!symInfo) {
      const err = new Error(`Variable "${name}" not declared`);
      err.line = assignLine || 0; err.col = assignCol || 0; throw err;
    }
    const newType = this.inferType(valueNode);
    if (newType !== symInfo.type) {
      const err = new Error(
        `Type mismatch: cannot assign ${newType} to "${name}" (declared as ${symInfo.type})`
      );
      err.line = assignLine || 0; err.col = assignCol || 0; throw err;
    }
  }
  checkExpression(node) {
    return this.inferType(node);
  }
  createScope() {
    return new Map(this.symbols);
  }
  restoreScope(snapshot) {
    this.symbols = new Map(snapshot);
  }
  /**
   * Get type information for a variable.
   */
  getVariableInfo(name) {
    return this.symbols.get(name) || null;
  }
  /**
   * Return current symbol table snapshot.
   */
  getVariables() {
    const result = new Map();
    for (const [name, info] of this.symbols) {
      result.set(name, info.type);
    }
    return result;
  }
}
module.exports = TypeChecker;