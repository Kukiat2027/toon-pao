import type { TExpression, TExpressionNode } from "../schema/expression";
import type { TExpressionTerm } from "../schema/output/expression";

export function toExpressionTerm(nodes: TExpression): TExpressionTerm {
  const root = nodes.find((n) => n.parentId === null);
  if (!root || root.type !== "operator" || !root.operator) {
    throw new Error("Expression must have an operator node as root");
  }
  return buildTerm(root, nodes);
}

function buildTerm(node: TExpressionNode, nodes: TExpression): TExpressionTerm {
  if (node.type !== "operator" || !node.operator) {
    throw new Error(`Expected operator node but got type="${node.type}" (id=${node.id})`);
  }

  const left = nodes.find((n) => n.parentId === node.id && n.position === "left");
  const right = nodes.find((n) => n.parentId === node.id && n.position === "right");
  if (!left || !right) {
    throw new Error(`Operator node id=${node.id} is missing a child`);
  }

  return {
    operator: node.operator,
    leftTerm: resolveTerm(left, nodes),
    rightTerm: resolveTerm(right, nodes),
  };
}

function resolveTerm(
  node: TExpressionNode,
  nodes: TExpression,
): TExpressionTerm | TExpressionTerm["leftTerm"] {
  if (node.type === "value") {
    if (!node.value) throw new Error(`Value node id=${node.id} has no value`);
    return node.value;
  }
  return buildTerm(node, nodes);
}
