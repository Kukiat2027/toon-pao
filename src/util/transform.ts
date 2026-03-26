import type { TExpression, TExpressionNode } from "../schema/expression";
import type { TExpressionTerm } from "../schema/expression";
import type { TValue } from "../schema/value";
import type { Field } from "../schema/field";

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

function formatExpressionTerm(term: TExpressionTerm | TValue): string {
  if ("operator" in term) {
    const left = formatExpressionTerm(term.leftTerm as TExpressionTerm | TValue);
    const right = formatExpressionTerm(term.rightTerm as TExpressionTerm | TValue);
    return `(${left} ${term.operator} ${right})`;
  }
  return `${term.type}:${term.val}`;
}

export function toMarkdown(field: Field): string {
  const lines: string[] = [
    `| Property | Value |`,
    `| --- | --- |`,
    `| **ID** | \`${field.id}\` |`,
    `| **UUID** | \`${field.uuid}\` |`,
    `| **Display Name** | ${field.displayName} |`,
    `| **Type** | \`${field.type}\` |`,
    `| **Description** | ${field.description} |`,
    `| **Sequence** | ${field.seq} |`,
    `| **Is Omit** | ${field.isOmit} |`,
  ];

  if (field.formatDate) {
    lines.push(`| **Date Format** | \`${field.formatDate}\` |`);
  }

  if (field.rules.length > 0) {
    lines.push("", "### Rules", "");
    for (const [i, rule] of field.rules.entries()) {
      lines.push(`#### Rule ${i + 1}`);
      lines.push("");
      lines.push(`- **Global**: ${rule.isGlobal}`);
      lines.push(`- **Sequence**: ${rule.seq}`);

      if (rule.formula) {
        lines.push(`- **Formula Type**: \`${rule.formula.type}\``);
        if (rule.formula.type === "expression") {
          lines.push(`- **Expression**: \`${formatExpressionTerm(rule.formula.code as unknown as TExpressionTerm)}\``);
        } else {
          const val = rule.formula.code as TValue;
          lines.push(`- **Value**: \`${val.val}\` (${val.type}, ${val.dataType})`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}