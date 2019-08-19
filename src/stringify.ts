import indent from "indent-string";
import { VisualData } from "./types";

const indentOptions = { indent: "  " };

/**
 * Given the object representation of the visual data for an element
 * a string of a pretty printed HTML representation will be returned.
 */
export function stringifyVisualData(data: VisualData | string | null) {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data.trim();
  }

  const tagName = data.tagName.toLowerCase();
  const attrs = printAttributes(data);
  const children = printChildren(data);

  return `<${tagName +
    (attrs.length
      ? attrs.length === 1
        ? ` ${attrs[0]}`
        : `\n${indent(attrs.join("\n"), 1, indentOptions)}\n`
      : "") +
    (children.length
      ? `>\n${indent(children.join("\n"), 1, indentOptions)}\n</${tagName}>`
      : "/>")}`;
}

function printAttributes(data: VisualData) {
  const { styles, attributes } = data;
  const parts: string[] = [];

  if (attributes) {
    for (const { name, value } of attributes) {
      parts.push(name + (value === "" ? "" : `=${JSON.stringify(value)}`));
    }
  }

  if (styles) {
    parts.push(printStyle(data));
  }

  return parts;
}

function printStyle({ styles }: VisualData) {
  if (!styles) {
    return "";
  }

  return `style="${printProperties(styles)}"`;
}

function printChildren(data: VisualData) {
  const { children } = data;
  return [printPseudoElements(data)]
    .concat((children || []).map(stringifyVisualData))
    .filter(Boolean);
}

function printPseudoElements(data: VisualData) {
  const { pseudoStyles } = data;

  if (!pseudoStyles) {
    return "";
  }

  return `<style scoped>\n${Object.keys(pseudoStyles)
    .map(name =>
      indent(
        `${name} {${printProperties(pseudoStyles[name])}}`,
        1,
        indentOptions
      )
    )
    .join("\n")}\n</style>`;
}

function printProperties(styles: { [x: string]: string }) {
  const parts: string[] = [];

  for (const name in styles) {
    parts.push(`${name}: ${styles[name]}`);
  }

  return parts.length === 1
    ? parts[0]
    : `\n${indent(parts.join(";\n"), 1, indentOptions)}\n`;
}