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
        const varType = this.symbols.get(node.value);
        if (!varType) {
          throw new Error(`Variable "${node.value}" used before declaration`);
        }
        return varType;
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
  checkDeclaration(name, valueNode) {
    if (this.symbols.has(name)) {
      throw new Error(`Variable "${name}" already declared`);
    }
    if (valueNode) {
      const type = this.inferType(valueNode);
      this.symbols.set(name, type);
    } else {
      this.symbols.set(name, 'number');
    }
  }
  checkAssignment(name, valueNode) {
    const existingType = this.symbols.get(name);
    if (!existingType) {
      throw new Error(`Variable "${name}" not declared`);
    }
    const newType = this.inferType(valueNode);
    if (newType !== existingType) {
      throw new Error(
        `Type mismatch: Cannot assign ${newType} to variable "${name}" of type ${existingType}`
      );
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
}
module.exports = TypeChecker;